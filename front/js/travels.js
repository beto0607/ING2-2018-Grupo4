var travels = null;
var travelInfo = null;
var userID = getCookie("userID");
var userPostulation = null;
var travelFromGet = null;
var copilotVote = null;
var travelMessageID = null;

function addTravels(d){
  $("#travelsContainer ul").empty();
  $.get('mustacheTemplates/travelsTravel.mst', function(template) {
    try{
      for(var i = 0; i< d.length; i++){
				if(d[i].fechaCancelacion != null){continue;}
        var date = new Date(d[i].fecha);
        d[i]["dateFormatted"] = date.toLocaleString();
        d[i]["isMine"] = userID == d[i].idUsuario;
        var rendered = Mustache.render(template, d[i]);
        $("#travelsContainer ul").append(rendered);
      }
      travels = d;
      infoLoaded("travels");
      ConfigureTravelsEvents();
    }catch(e){
      console.log(e);
    }

  });
}
function travelClick(travelID){
	console.log("ADSF");
	var tID = $(this).attr("travel-id") ? $(this).attr("travel-id"):travelID;
	if(travelInfo && travelInfo.idViaje == tID){
		travelInfoLoaded();
		return;
	}
	$.post(URLs.travelInfo, {id:tID})
	.done(function(d){
		d = parseJSON(d);
		d = formatTravelInfo(d);
		travelInfo = getTravel(tID);
		travelInfo.serverTravel = d;
		$.post(URLs.travelCopilots, {id: tID})
			.done(function(d){
				d = parseJSON(d);
				travelInfo["copilots"] = d.success == "1" ? d.copilotos : [];
				$.post(URLs.travelPostulations, {id: tID})
					.done( function(d){
						console.log(d);
						d = parseJSON(d);
						travelInfo["postulations"] = d.success == "1" ? d.postulaciones : [];
						$.post(URLs.travelCalifications, {idViaje: tID}).
						done(function(d){
							d = parseJSON(d);
							console.log(d);
							travelInfo["califications"] = d.success == "1" ? d.calificaciones : [];
							travelInfoLoaded();
						})
					});
			});
	})
	.fail(onFailPost);
}
function formatTravelInfo(d){
	for(var i in d.mensajes){
		var fMensaje = new Date(d.mensajes[i].fechaMensaje);
		d.mensajes[i].fMensajeFormatted = fMensaje.toLocaleString();
		if(d.mensajes[i].respuesta){
			var fRespuesta = new Date(d.mensajes[i].fechaRespuesta);
			d.mensajes[i].fRespuestaFormatted = fRespuesta.toLocaleString();
		}
	}
	return d;
}
function addCalifications(){
	if(travelInfo["hasCopilots"]){
		for(var i in travelInfo["califications"]){
			for (var c in travelInfo["copilots"]) {
				if(travelInfo["copilots"][c].id == travelInfo["califications"][i].IdUsuarioCalificado){
					travelInfo["copilots"][c].calified = true;
					travelInfo["copilots"][c].calification = travelInfo["califications"][i].calificacion;
					travelInfo["copilots"][c].observations = travelInfo["califications"][i].observaciones;
				}
			}
		}
	}
}
function travelInfoLoaded(){
  if(travelInfo.isMine){
		travelInfo["hasPostulations"] = travelInfo["postulations"].length != 0;
		travelInfo["hasCopilots"] = travelInfo["copilots"].length != 0;
		addCalifications();
    $.get('mustacheTemplates/travelsInfoMine.mst', showTravelInfo);
  }else{
		//El viaje no es mio
		travelInfo["isPostulant"] = isPostulant();
		var p = getPostulation();
		travelInfo["postulation"] = {
			"approved": p && p.fechaAprobacion ? p.fechaAprobacion != null : false,
			"canceled": p && p.fechaCancelacion ? p.fechaCancelacion != null :false,
			"desapproved":  p && p.fechaRechazo ? p.fechaRechazo != null :false
		};

		travelInfo["isCopilot"] = isCopilot();
		var c = getCopilotState();
		travelInfo["copilotState"] = {
			"paid": c && c.fechaPago ? c.fechaPago != null : false,
			"canceled" : false,
			"calified": false//FALTA AGREGAR EL ESTADO "CALIFICASTE",

		};
		travelInfo["copilotState"] = travelInfo["isCopilot"] ? getCopilotState(): "<VACÍO>";

		travelInfo["canPostulate"] =
			!travelInfo["isCopilot"] &&
			//(travelInfo["isCopilot"] && (!travelInfo["copilotState"]["canceled"])) ||
			!travelInfo["isPostulant"] ||
			(travelInfo["isPostulant"] && travelInfo["postulation"]["canceled"]) ;
				//!(travelInfo["isCopilot"] || travelInfo["isPostulant"]);
		//travelInfo["postulationState"] = travelInfo["isPostulant"] ? getPostulationState(): "<VACÍO>";
    $.get('mustacheTemplates/travelsInfoNotMine.mst', showTravelInfo);
  }
}
function getPostulation(){
	for(var c in travelInfo.postulations){
		c =travelInfo.postulations[c];
		if(c.id == userID){
			return c;
		}
	}
}
function getCopilotState(){
	for(var c in travelInfo.copilots){
		c =travelInfo.copilots[c];
		if(c.id == userID){
			return c;
		}
	}
}
//-----CANCELAR COPILOTO AL VIAJE----
function cancelCopilotClick(){
	bConfirmCallbacks("¿Seguro que desea cancela la reserva al viaje? De haber pagado, se le devolverá el dinero pero será calificado negativamente", cancelCopilot);
}
function cancelCopilot(r){
	if(!r){return;}
	$.post(URLs.travelCancelReserve,
		{idViaje: travelInfo.idViaje, idUsuario: userID, observaciones: "El usuario canceló el viaje.*Mensaje generado automáticamente."})
		.done(function(d,s){
			d = parseJSON(d);
			if(d.success == "1"){
				bAlertCallback("Reserva cancelada. Se envió notificación al piloto.", reloadPage);
			}else{
				bAlert(""+d.mensaje);
			}
		});
}
//-------POSTULARSE-----
function postulateButtonClick(){
	bConfirmCallbacks("¿Seguro que desea postularse en el viaje?", postulateButton);
}
function postulateButton(r){
	if(!r){return;}
	$.post(URLs.travelPostulate,
		{idViaje: travelInfo.idViaje, idUsuario: userID})
		.done(function(d,s){
			d = parseJSON(d);
			if(d.success=="1"){
				bAlertCallback("Postulación enviada. Se envió notificación al piloto.", reloadPage);
			}else{
				bAlert(""+d.mensaje);
			}
		});
}
//-------APROBAR POSTULACIÓN-----
function approvePostulationClick(){
	userPostulation = $(this).parent().attr("user-id");
	var username = $(this).parent().attr("user-name");
	bConfirmCallbacks("¿Seguro que desea aprobar la postulación de " + username + "?", approvePostulation);
}
function approvePostulation(r){
	if(!r){return;}
	$.post(URLs.travelApprove,
		{idViaje: travelInfo.idViaje, idUsuario: userPostulation})
		.done(function(d,s){
			d = parseJSON(d);
			if(d.success == "1"){
				bAlertCallback("Postulación aprobada. Se envió notificación al copiloto.", reloadPage);
			}else{
				bAlert(""+d.mensaje);
			}
		});
}
//-----DESAPROBAR POSTULACIÓN----
function desapprovePostulationClick(){
	userPostulation = $(this).parent().attr("user-id");
	var username = $(this).parent().attr("user-name");
	bConfirmCallbacks("¿Seguro que desea desaprobar la postulación de " + username + "?", desapprovePostulation);
}
function desapprovePostulation(r){
	if(!r){return;}
	$.post(URLs.travelDesapprove,
		{idViaje: travelInfo.idViaje, idUsuario: userPostulation})
		.done(function(d){
			d = parseJSON(d);
			if(d.success == "1"){
				bAlertCallback("Postulación desaprobada. Se envió notificación al copiloto.", reloadPage);
			}else{
				bAlert(""+d.mensaje);
			}
		});
}
//-----CANCELAR POSTULACION AL VIAJE----
function cancelPostulationClick(){
	bConfirmCallbacks("¿Seguro que desea cancela la postulación al viaje?", cancelPostulation);
}
function cancelPostulation(r){
	if(!r){return;}
	$.post(URLs.travelCancelPostulation,
		{idViaje: travelInfo.idViaje, idUsuario: userID})
		.done(function(d,s){
			d = parseJSON(d);
			if(d.success == "1"){
				bAlertCallback("Postulación eliminada. Se envió notificación al piloto.", reloadPage);
			}else{
				bAlert(""+d.mensaje);
			}
		});
}
//-----CANCELAR VIAJE----
function cancelTravelClick(){
	var cops = parseInt(travelInfo.copilotos);

	bConfirmCallbacks(
		"¿Seguro que desea cancelar el viaje?" + (cops == 0 ? "" : " Se devolverá el dinero, y serás calificado negativamente."), cancelTravel);
}
function cancelTravel(r){
	if(!r){return;}

	$.post(URLs.travelCancel,
		{id: travelInfo.idViaje})
		.done(function(d,s){
			d = parseJSON(d);
			if(d.success == "1"){
				var cops = parseInt(travelInfo.copilotos);

				bAlertCallback("Viaje eliminado."+(cops == 0 ? "": " Se enviaron las notificaciones a los copilotos."), reloadPage);
			}else{
				bAlert(""+d.mensaje);
			}
		});
}
function showTravelInfo(template){
	console.log(travelInfo);
  $("#travelInfoModal .modal-body").empty();
  var rendered = Mustache.render(template, travelInfo);
  $("#travelInfoModal .modal-body").append(rendered);
  $("#travelInfoModal").modal("show");
	ConfigureTravelInfoEvents();
}
function ConfigureTravelInfoEvents(){
	$(".travelPostulateButton").on("click", postulateButtonClick);
	$(".travelCancelButton").on("click", cancelTravelClick);
	$(".travelCancelPostulationButton").on("click", cancelPostulationClick);
	$(".travelDesapproveButton").on("click", desapprovePostulationClick);
	$(".travelApproveButton").on("click", approvePostulationClick);
	$(".travelCancelCopilotButton").on("click", cancelCopilotClick);
	$(".questionSubmit").on("click", sendQuestionSubmit);
	$(".votePilotSubmit").on("click", sendCalificationPilotSubmit);
	$(".voteCopilotSubmit").on("click", sendCalificationCopilotSubmit);
	$(".sendCalification").on("click",sendCalificationCopilotPrompt);

	$(".answerQuestion").on("click", answerQuestionButton);

	$(".payButton").on("click", payButton);
}
function getTravel(id){
  for(var t = 0; t < travels.length; t++){
    if(travels[t].idViaje == id){
      return travels[t];
    }
  }
  return null;
}
function Configure(){
  travelFromGet = new URL(window.location.href).searchParams.get("travel");

  showSpinner();
  loadTravels();


}
function ConfigureTravelsEvents(){
  $(".travelListItem").on("click", travelClick);

  if(travelFromGet != null && $("#travelsContainer li[travel-id=\""+travelFromGet+"\"]").length != 0){
    $("#travelsContainer li[travel-id=\""+travelFromGet+"\"]").click();
  }
}
function infoLoaded(item){
	loadItems[item] = true;
	var t = true;
	var k = Object.keys(loadItems);
	for(var i = 0; i<k.length; i++){
		t = t && loadItems[k[i]];
	}
	if(t){
		hideSpinner();
	}
}

/***************Califications*********************/
function sendCalificationPilotSubmit(){
	var cal = $(".votePilot").val();
	var desc = $(".votePilotText").val();
	if(cal > 0 && cal <5 && desc.length >0){
		bConfirmCallbacks("¿Enviar la calificación?",sendCalificationPilotConfirm);
	}else{
		if(desc.length <=0){
			bAlert("Debe ingresar una descripción.");
		}else{
			bAlert("Debe ingresar una calificación entre 1 y 5");
		}
	}
}
function sendCalificationPilotConfirm(r){
	if(!r){return;}
	$.post(URLs.travelCalificatePilot,
		{
			idViaje: travelInfo.idViaje,
			idUsuarioCopiloto: userID,
			idUsuarioPiloto: travelInfo.idUsuario,
			calificacion: $(".votePilot").val(),
			observaciones: $(".votePilotText").val()
		}).done(function(d){
			console.log(d);
			d = parseJSON(d);
			if(d.success == "1"){
				bAlertCallback(d.mensaje, function(){travelClick(travelInfo.idViaje)});
			}else{
				bAlert(""+d.mensaje);
			}
		}).fail(onFailPost);
}
function sendCalificationCopilotSubmit(){
	copilotVote = $(this).attr("copilotId");
	$.get('mustacheTemplates/vote.mst', function(template) {
		var rendered = Mustache.render(template, {to:"Copilot"});
		$("#voteCopilotModal .modal-body").empty().html(rendered);
		$("#voteCopilotModal").modal("show");
	});
}
function sendCalificationCopilotPrompt(){
	var cal = $(".voteCopilotNumber").val();
	var desc = $(".voteCopilotText").val();
	if(cal > 0 && cal <5 && desc.length >0){
		bConfirmCallbacks("¿Enviar la calificación?",sendCalificationPilotConfirm);
	}else{
		if(desc.length <=0){
			bAlert("Debe ingresar una descripción.");
		}else{
			bAlert("Debe ingresar una calificación entre 1 y 5");
		}
	}
}
function sendCalificationCopilotConfirm(r){
	if(!r){return;}
	$.post(URLs.travelCalificateCopilot,
		{
			idViaje: travelInfo.idViaje,
			idUsuarioPiloto: userID,
			idUsuarioCopiloto: copilotVote,
			calificacion: $(".voteCopilot").val(),
			observaciones: $(".voteCopilotText").val()
		}).done(function(d){
			console.log(d);
			d = parseJSON(d);
			if(d.success == "1"){
				bAlertCallback(d.mensaje, function(){travelClick(travelInfo.idViaje)});
			}else{
				bAlert(""+d.mensaje);
			}
		}).fail(onFailPost);
}
/***************MESSAGES*********************/
function sendQuestionSubmit(){
	if($(".questionInput").val().length>0){
		bConfirmCallbacks("¿Enviar pregunta?", sendQuestionConfirm);
	}
}
function sendQuestionConfirm(r){
	if(!r){return;}
	$.post(URLs.travelSendQuestion, {
		idViaje: travelInfo.idViaje,
		mensaje: $(".questionInput").val(),
		idUsuario: userID
	}).done(function(d){
		console.log(d);
		d = parseJSON(d);
		if(d.success == "1"){
			bAlertCallback(d.mensaje, function(){travelClick(travelInfo.idViaje)});
		}else{
			bAlert(""+d.mensaje);
		}
	}).fail(onFailPost);
}
function answerQuestionButton(){
	travelMessageID = $(this).attr("questionId");
	bPromptCallback("Ingrese su respuesta.",answerQuestionSend);
}
function answerQuestionSend(r){
	if(!r){return;}
	$.post(URLs.travelSendAnswer,{
		idMensaje: travelMessageID,
		respuesta: r,
		idViaje: travelInfo.idViaje
	}).done(function(d){
		d = parseJSON(d);
		if(d.success == "1"){
			bAlertCallback(d.mensaje, reloadPage);
		}else{
			bAlert(""+d.mensaje);
		}
	}).fail(onFailPost);
}

/**********PAGO*******/
function payButton(){
	$.get("mustacheTemplates/pay.mst", function(template){
		try{
			console.log(travelInfo);
			var rendered = Mustache.render(template, {monto: travelInfo.montoCopiloto});
			$("#payModal .modal-body").empty().html(rendered);
			$(".confirmPay").on("click", verifyPayForm);

			$("#payModal").modal("show");
    }catch(e){
      console.log(e);
    }
	});
}
function verifyPayForm(){
	$.validator.addMethod("cvvPattern", function (value, element, options){
		var rg = /^[0-9]{3,4}$/;
    return value.match(rg);
	},"Código inválido.");
	$.validator.addMethod("creditNumberPattern", function (value, element, options){
		var rg = /^[0-9]{13,16}$/;
    return value.match(rg);
	},"Código inválido.");

	var month = parseInt($("#payModal .modal-body form select[name='month']").val());
	var year = parseInt($("#payModal .modal-body form select[name='year']").val());
	var date = new Date();


	if($('#payModal form input[name="cvv"]').val() == "111"){
		bAlert("Tarjeta inválida.");
	}else if($('#payModal form input[name="cvv"]').val() == "222"){
		bAlert("Tarjeta inválida.");
	}
	if(year == 18 && month<8){
		bAlert("Fecha inválida.");
		return;
	}
	$("#payModal .modal-body form").validate({
		onfocusout: false,
		rules: {
			"creditNumber": {
				required: true,
				"creditNumberPattern": {data:"creditNumber"}
			},
			"owner": {
				required: true
			},
			"cvv": {
				required: true,
				"cvvPattern": {data: "cvv"}
			}
		},
		messages:{
			"creditNumber": {
				required: "Debe ingresar el número de la tarjeta."
			},
			"cvv": {
				required: "Debe ingresar el código de seguridad."
			}
		},
		submitHandler: sendPay
	});
}
function sendPay(){
	var data = {
		month: parseInt($("#payModal .modal-body form select[name='month']").val()),
		year: parseInt($("#payModal .modal-body form select[name='year']").val()),
		creditNumber: $('#payModal form input[name="creditNumber"]').val(),
		owner: $('#payModal form input[name="owner"]').val(),
		cvv: $('#payModal form input[name="cvv"]').val()
	};
	console.log(data);
	bConfirmCallbacks("¿Realizar pago?", function(r){
		if(!r){return;}

		$.post(URLs.travelPay, {
			idViaje: travelInfo.idViaje,
			idUsuario: userID
		})
		.done(function(d){
			d = parseJSON(d);
			console.log(d);
			if(d.success == "1"){
				bAlertCallback(d.mensaje, reloadPage);
			}else{
				bAlert(""+d.mensaje);
			}
		})
		.fail(onFailPost);
	});
}
