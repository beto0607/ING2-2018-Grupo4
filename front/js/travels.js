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
        console.log(d[i]);
        if(date >= new Date()){
          var rendered = Mustache.render(template, d[i]);
          $("#travelsContainer ul").append(rendered);
        }
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
    travelInfo.calificacionPiloto = clamp0(travelInfo.calificacionPiloto);
    travelInfo.calificacionCopiloto = clamp0(travelInfo.calificacionCopiloto);
		$.post(URLs.travelCopilots, {id: tID})
			.done(function(d){
				d = parseJSON(d);
        d = d.success == "1" ? d.copilotos : [];
        d = clamp0Array(d, "calificacionPiloto");
        d = clamp0Array(d, "calificacionCopiloto");
				travelInfo["copilots"] = d;
				$.post(URLs.travelPostulations, {id: tID})
					.done( function(d){
						d = parseJSON(d);
            d = d.success == "1" ? d.postulaciones : [];
            d = clamp0Array(d, "calificacionPiloto");
            d = clamp0Array(d, "calificacionCopiloto");
						travelInfo["postulations"] = d;
						$.post(URLs.travelCalifications, {idViaje: tID}).
						done(function(d){
							d = parseJSON(d);
              d = d.success == "1" ? d.calificaciones : [];
              d = clamp0Array(d, "calificacionPiloto");
              d = clamp0Array(d, "calificacionCopiloto");
							travelInfo["califications"] = d;

              travelInfo["happened"] = new Date()>new Date(travelInfo["fecha"]);
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
  d.calificacionCopiloto = clamp0(d.calificacionCopiloto);
  d.calificacionPiloto = clamp0(d.calificacionPiloto);

	return d;
}
function addCalifications(){
	if(travelInfo["hasCopilots"]){
		for(var i in reputation){
      if(reputation[i].idViaje == travelInfo.idViaje){
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
}
function travelCalifiedInfo(){
  for(var i in reputation){
    if(reputation[i].idViaje == travelInfo.idViaje && reputation[i].idUsuarioCalifica == userID){
      return reputation[i];
    }
  }
  return null;
}
function travelCalifiedState(){
  for(var i in reputation){
    if(reputation[i].idViaje == travelInfo.idViaje && reputation[i].idUsuarioCalifica == userID){
      return true;
    }
  }
  return false;
}
function hasCanceledPostulation(isPostulant){
  var c = false;
  if(isPostulant){
    for(var p in travelInfo.postulations){
  		p = travelInfo.postulations[p];
  		if(p.id == userID){
  			c = c || (p.fechaCancelacion != null);
  		}
  	}

  }
  return c;
}
function travelInfoLoaded(){
  if(travelInfo.isMine){

		travelInfo["hasPostulations"] = travelInfo["postulations"].length != 0;
		travelInfo["hasCopilots"] = travelInfo["copilots"].length != 0;
		addCalifications();
    console.log(travelInfo);
    $.get('mustacheTemplates/travelsInfoMine.mst', showTravelInfo);
  }else{

		travelInfo["isPostulant"] = isPostulant();
    travelInfo["plazasDisponibles"] = 0;
    travelInfo["canPostulate"] =
        canPostulate() &&
        parseInt(travelInfo["plazasDisponibles"]) > 0 &&
        !travelInfo["isCopilot"];
    travelInfo["minePostulations"] = getMinePostulations();

		travelInfo["isCopilot"] = isCopilot();
		var c = getCopilotState();

    travelInfo["copilotState"] = travelInfo["isCopilot"] ? getCopilotState(): "<VACÍO>";
		travelInfo["copilotState"] = {
			"paid": c != null && c.fechaPago != null ,//&& new Date()<new Date(travelInfo.fecha)
			"canceled" : false,
			"calified": travelCalifiedState(),
      "calification": travelCalifiedInfo(),
      "canCalify": travelInfo["happened"] && c != null && c.fechaPago != null
		};


    travelInfo["canCalify"] = false;
    console.log(travelInfo);
    $.get('mustacheTemplates/travelsInfoNotMine.mst', showTravelInfo);
  }
}
function getMinePostulations(){
  var ret = [];
  for(var p in travelInfo.postulations){
    console.log();
    if(travelInfo.postulations[p].id == userID){
      ret.push(travelInfo.postulations[p]);
    }
  }
  return ret;
}
function canPostulate(){
  var canceled = false;
  for(var c in travelInfo.postulations){
    c =travelInfo.postulations[c];
    if(c.id == userID){
      if(c.fechaCancelacion == null && c.fechaRechazo == null){
        return false;
      }
    }
  }
  return true;
}
function getPostulation(){
  var ret = null
	for(var c in travelInfo.postulations){
		c =travelInfo.postulations[c];
		if(c.id == userID){
      if(ret == null || new Date(ret.fechaPostulacion) < new Date(c.fechaPostulacion)){
        ret = c;
      }
		}
	}
  return ret;
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
				bAlertCallback("Reserva cancelada. Se envió notificación al piloto.", reloadPageTravel);
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
				bAlertCallback("Postulación enviada. Se envió notificación al piloto.", reloadPageTravel);
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
				bAlertCallback("Postulación aprobada. Se envió notificación al copiloto.", reloadPageTravel);
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
				bAlertCallback("Postulación desaprobada. Se envió notificación al copiloto.", reloadPageTravel);
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
				bAlertCallback("Postulación eliminada. Se envió notificación al piloto.", reloadPageTravel);
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
  $(".votePilot").on("click", sendCalificationPilotSubmit);

	$(".voteCopilotSubmit").on("click", sendCalificationCopilotSubmit);

	$(".sendCalification").on("click",sendCalificationCopilotPrompt);

	$(".answerQuestion").on("click", answerQuestionButton);

	$(".payButton").on("click", payButton);

  $(".editTravel").on("click",myTravelInfo);
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
  travelFromGet = new URL(window.location.href).searchParams.get("t");

  showSpinner();
  loadTravels();
}
function ConfigureTravelsEvents(){
  $(".travelListItem").on("click", travelClick);
  travelFromGet =new URL(window.location.href).searchParams.get("t");
  if(travelFromGet != null && $("li[travel-id="+travelFromGet+"]").length != 0){
    $("li[travel-id="+travelFromGet+"]").click();
  }


  $(".searchInput").on("keydown",function(e){
    if($(this).val().length >= 3){
      var search = $(this).val().toLowerCase();
      $("input.maxMonto, input.minMonto, #lastTravelsContainer label").show();
      $("input.maxFecha, input.minFecha, #lastTravelsContainer label").show();
      reloadSearch();

    }else{
      $("#lastTravelsContainer li").show();
      $("input.maxMonto, input.minMonto, #lastTravelsContainer label").hide();
      $("input.maxFecha, input.minFecha, #lastTravelsContainer label").hide();

    }
  });
  $("input.maxMonto, input.minMonto, input.maxFecha, input.minFecha, #lastTravelsContainer label").hide();
  $("input.minFecha, input.maxFecha, input.maxMonto, input.minMonto").on("change",reloadSearch);
}
function reloadSearch(){
  var
  search = $(".searchInput").val() ? $(".searchInput").val().toLowerCase() : null;
  $("#lastTravelsContainer li.travelListItem").each(function(){
    if(search != null && search.length >= 3){
      var t = getTravel($(this).attr("travel-id"));
      var
      minMonto = parseFloat($("input.minMonto").val() ? $("input.minMonto").val() : t.montoCopiloto),
      maxMonto = parseFloat($("input.maxMonto").val() ? $("input.maxMonto").val() : t.montoCopiloto),
      minFecha = new Date($("input.minFecha").val() ? $("input.minFecha").val() : t.fecha),
      maxFecha = new Date($("input.maxFecha").val() ? $("input.maxFecha").val() : t.fecha);

      if(satisfySearch(t,search)){
        var montoCopiloto = parseFloat(t.montoCopiloto);
        var fecha = new Date(t.fecha);

        if(minMonto <= montoCopiloto && maxMonto >= montoCopiloto && minFecha <= fecha && maxFecha >= fecha){
          $(this).show();
        }else{
          $(this).hide();
        }
      }else{
        $(this).hide();
      }
    }else{
      $(this).show();
    }
  });
}
function satisfySearch(t,s){
  var search = s ? s :$(".searchInput").val().toLowerCase();
  return t.origen.toLowerCase().indexOf(search) != -1 ||
  t.destino.toLowerCase().indexOf(search) != -1 ||
  t.descripcionViaje.toLowerCase().indexOf(search) != -1;
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
  $.get('mustacheTemplates/vote.mst', function(template) {
    var rendered = Mustache.render(template, {to:"Pilot"});
    $("#voteCopilotModal .modal-body").empty().html(rendered);
    $("#voteCopilotModal").modal("show");
    $(".sendCalification").off("click").on("click",sendCalificationPilotPrompt);
  });
}
function sendCalificationPilotPrompt(){
  var cal = $("select[name='votePilotNumber']").val();
	var desc = $("input[name='votePilotText']").val();
  if(cal > -2 && cal <2 && desc.length >0){
		bConfirmCallbacks("¿Enviar la calificación?",sendCalificationPilotConfirm);
	}else{
		if(desc.length <=0){
			bAlert("Debe ingresar una descripción.");
		}else{
			bAlert("Debe ingresar una calificación válida.");
		}
	}
}
function sendCalificationPilotConfirm(r){
	if(!r){return;}
  var data =
  {
    idViaje: travelInfo.idViaje,
    idUsuarioCopiloto: userID,
    idUsuarioPiloto: travelInfo.idUsuario,
    calificacion: $("select[name='votePilotNumber']").val(),
    observaciones: $("input[name='votePilotText']").val()
  };
	$.post(URLs.travelCalificatePilot,data
  ).done(function(d){
			console.log(d);
			d = parseJSON(d);
			if(d.success == "1"){
				bAlertCallback(d.mensaje, reloadPageTravel);
			}else{
				bAlert(""+d.mensaje);
			}
		}).fail(onFailPost);
}
/***************CalificationsCOPILOT*********************/

function sendCalificationCopilotSubmit(){
	copilotVote = $(this).attr("copilotId");
  console.log(copilotVote);
	$.get('mustacheTemplates/vote.mst', function(template) {
		var rendered = Mustache.render(template, {to:"Copilot"});
		$("#voteCopilotModal .modal-body").empty().html(rendered);
		$("#voteCopilotModal").modal("show");
    $(".sendCalification").off("click").on("click",sendCalificationCopilotPrompt);
	});
}
function sendCalificationCopilotPrompt(){
	var cal = $("select[name='voteCopilotNumber']").val();
	var desc = $("input[name='voteCopilotText']").val();

	if(cal > -2 && cal <2 && desc.length >0){
		bConfirmCallbacks("¿Enviar la calificación?",sendCalificationCopilotConfirm);
	}else{
		if(desc.length <=0){
			bAlert("Debe ingresar una descripción.");
		}else{
			bAlert("Debe seleccionar una calificacion.");
		}
	}
}
function sendCalificationCopilotConfirm(r){
	if(!r){return;}
  var data = {
    idViaje: travelInfo.idViaje,
    idUsuarioPiloto: userID,
    idUsuarioCopiloto: copilotVote,
    calificacion: $("select[name='voteCopilotNumber']").val(),
    observaciones: $("input[name='voteCopilotText']").val()
  };
	$.post(URLs.travelCalificateCopilot, data
		).done(function(d){
			console.log(d);
			d = parseJSON(d);
			if(d.success == "1"){
				bAlertCallback(""+d.mensaje, reloadPageTravel);
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
			bAlertCallback(d.mensaje, reloadPageTravel);
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
			bAlertCallback(d.mensaje, reloadPageTravel);
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
    return;
	}else if($('#payModal form input[name="cvv"]').val() == "222"){
		bAlert("Tarjeta sin saldo.");
    return;
	}
	if(year == date.getFullYear()	- 2000 && month<date.getMonth()){
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
				bAlertCallback(d.mensaje, reloadPageTravel);
			}else{
				bAlert(""+d.mensaje);
			}
		})
		.fail(onFailPost);
	});
}
