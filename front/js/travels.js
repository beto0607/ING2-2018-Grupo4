var URLs = {
	travelsList:"../index.php?c=viajes&a=Listar&debug=1",
  travelInfo: "../index.php?c=viaje&a=Obtener&debug=1",

  travelPostulate: "../index.php?c=viaje&a=PostularCopiloto&debug=1",
  travelCancelPostulation: "../index.php?c=viaje&a=CancelarPostulacion&debug=1",
  travelCancelReserve: "../index.php?c=viaje&a=CancelarReserva&debug=1",

  travelApprove: "../index.php?c=viaje&a=AprobarPostulacion&debug=1",
  travelDesapprove: "../index.php?c=viaje&a=DesaprobarPostulacion&debug=1",

  travelCancel:  "../index.php?c=viaje&a=Cancelar&debug=1",
};

var loadItems = {
	"travels": false
};
var travels = null;
var travelInfo = null;
var userID = getCookie("userID");
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
        var t = d[i];
        var date = new Date(t.fecha);
        t["dateFormatted"] = date.toLocaleString();
        t["isMine"] = userID == t.idUsuario;
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
  travelInfo = getTravel(tID);
  travelInfo["isCopilot"] = true;
  if(travelInfo.isMine){
    $.get('mustacheTemplates/travelsInfoMine.mst', showTravelInfo);
  }else{
    $.get('mustacheTemplates/travelsInfoNotMine.mst', showTravelInfo);
  }
}
function showTravelInfo(template){

  $("#travelInfoModal .modal-body").empty();
  var rendered = Mustache.render(template, travelInfo);
  $("#travelInfoModal .modal-body").append(rendered);
  $("#travelInfoModal").modal("show");
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
