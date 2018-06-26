var URLs = {
	travelsList:"../index.php?c=viajes&a=Listar&debug=1",
  travelInfo: "../index.php?c=viaje&a=Obtener&debug=1",

  travelPostulate: "../index.php?c=viaje&a=PostularCopiloto&debug=1",
  travelCancelPostulation: "../index.php?c=viaje&a=CancelarPostulacion&debug=1",
  travelCancelReserve: "../index.php?c=viaje&a=CancelarReserva&debug=1",

  travelApprove: "../index.php?c=viaje&a=AprobarPostulacion&debug=1",
  travelDesapprove: "../index.php?c=viaje&a=DesaprobarPostulacion&debug=1",

  travelCancel:  "../index.php?c=viaje&a=Cancelar&debug=1",

	travelCopilots: "../index.php?c=viaje&a=ObtenerCopilotos&debug=1",
	travelPostulations: "../index.php?c=viaje&a=ObtenerPostulaciones&debug=1",
};

var loadItems = {
	"travels": false
};
var travels = null;
var travelInfo = null;
var userID = getCookie("userID");
var userPostulation = null;
var travelFromGet = null;
$(document).ready(function(){
	userID = getCookie("userID");
  if(!userID || userID == ""){goToIndex();}
  Configure();
});
function loadTravels(){
	$.post(URLs.travelsList)
		.done(function(d,s){
			d = parseJSON(d);
      d = orderTravels(d);
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
function travelClick(){
	var tID = $(this).attr("travel-id");
	if(travelInfo && travelInfo.idViaje == tID){
		travelInfoLoaded();
		return;
	}
	travelInfo = getTravel(tID);
	$.post(URLs.travelCopilots, {id: tID})
		.done(function(d){
			console.log(d);
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
    $.get('mustacheTemplates/travelsInfoMine.mst', showTravelInfo);
  }else{
		travelInfo["isPostulant"] = isCopilot();
		travelInfo["isCopilot"] = isCopilot();
		travelInfo["postulationState"] = "";
    $.get('mustacheTemplates/travelsInfoNotMine.mst', showTravelInfo);
  }
}
//-----CANCELAR COPILOTO AL VIAJE----
function cancelCopilotClick(){
	bConfirmCallbacks("¿Seguro que desea cancela la reserva al viaje? De haber pagado, se le devolverá el dinero pero será calificado negativamente", cancelCopilot);
}
function cancelCopilot(){
	$.post(URLs.travelCancelReserve,
		{idViaje: travelInfo.idViaje, idUsuario: userID, observaciones: "El usuario canceló el viaje.*Mensaje generado automáticamente."})
		.done(function(d,s){
			d = parseJSON(d);
			if(d.success == "1"){
				bAlertCallback("Reserva cancelada.", reloadPage);
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
function approvePostulation(){
	$.post(URLs.travelApprove,
		{idViaje: travelInfo.idViaje, idUsuario: userPostulation})
		.done(function(d,s){
			d = parseJSON(d);
			if(d.success == "1"){
				bAlertCallback("Postulación aprobada.", reloadPage);
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
function desapprovePostulation(){
	$.post(URLs.travelDesapprove,
		{idViaje: travelInfo.idViaje, idUsuario: userPostulation})
		.done(function(d){
			d = parseJSON(d);
			if(d.success == "1"){
				bAlertCallback("Postulación desaprobada.", reloadPage);
			}else{
				bAlert(""+d.mensaje);
			}
		});
}
//-----CANCELAR POSTULACION AL VIAJE----
function cancelPostulationClick(){
	bConfirmCallbacks("¿Seguro que desea cancela la postulación al viaje?", cancelPostulation);
}
function cancelPostulation(){
	$.post(URLs.travelCancelPostulation,
		{idViaje: travelInfo.idViaje, idUsuario: userID})
		.done(function(d,s){
			d = parseJSON(d);
			if(d.success == "1"){
				bAlertCallback("Postulación eliminada.", reloadPage);
			}else{
				bAlert(""+d.mensaje);
			}
		});
}
//-----CANCELAR VIAJE----
function cancelTravelClick(){
	bConfirmCallbacks("¿Seguro que desea cancelar el viaje? Se devolverá el dinero, y serás calificado negativamente.", cancelTravel);
}
function cancelTravel(){
	$.post(URLs.travelCancel,
		{id: travelInfo.idViaje})
		.done(function(d,s){
			d = parseJSON(d);
			if(d.success == "1"){
				bAlertCallback("Viaje eliminado.", reloadPage);
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
	$(".travelCancelButton").on("click", cancelTravelClick);
	$(".travelCancelPostulationButton").on("click", cancelPostulationClick);
	$(".travelDesapproveButton").on("click", desapprovePostulationClick);
	$(".travelApproveButton").on("click", approvePostulationClick);
	$(".travelCancelCopilotButton").on("click", cancelCopilotClick);
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
