var travels = null;
var travelInfo = null;
var userID = getCookie("userID");
var userPostulation = null;
var travelFromGet = null;
var copilotVote = null;
$(document).ready(function(){
	/*userID = getCookie("userID");
  if(!userID || userID == ""){goToIndex();}
  Configure();*/
});
function loadTravels(){
	$.post(URLs.travelsList)
		.done(function(d,s){
			d = parseJSON(d);
      //d = orderTravels(d);
      console.log(d);
			addTravels(d);
		})
		.fail(onFailPost)
}
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
	travelInfo = getTravel(tID);
	$.post(URLs.travelCopilots, {id: tID})
		.done(function(d){
			d = parseJSON(d);
			travelInfo["copilots"] = d.success == "1" ? d.copilotos : [];
			$.post(URLs.travelPostulations, {id: tID})
				.done( function(d){
					console.log(d);
					d = parseJSON(d);
					travelInfo["postulations"] = d.success == "1" ? d.postulaciones : [];
					travelInfoLoaded();
				});
		});
}
function travelInfoLoaded(){
	console.log(travelInfo);
  if(travelInfo.isMine){
		travelInfo["hasPostulations"] = travelInfo["postulations"].length != 0;
		travelInfo["hasCopilots"] = travelInfo["copilots"].length != 0;
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
	$(".votePilotSubmit").on("click", sendCalificationSubmit);
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
function calificateCopilot(){
	copilotVote = $(this).attr("copilotId");
}
function sendCalificationCopilotSubmit(){
	var cal = $(".voteCopilot").val();
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
