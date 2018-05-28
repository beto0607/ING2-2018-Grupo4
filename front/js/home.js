var URLs = {
	travelsList:"../index.php?c=viaje&a=Listar",
	signup:"../index.php?c=usuario&a=Guardar"
};
var dialog;
$(document).ready(function(){
	Configure();
	/*------------Eventos generales------------*/
	$("#optionsContainer .option").on("click", function(e){
		const s = $(this).attr("data-target");
		setTimeout(function(){window.scrollTo(0, $(s).position().top - 100);},500);
		return e;
	});
	/*------------Eventos del manejo de viajes------------*/
	$(".travelListItem").on("click", travelListItemClick);
	/*------------Eventos del manejo de vehiculos------------*/
	$("#vehiclesContainer .infoButton").on("click",vehicleInfoButtonClicked);
	$("#modifyVehicleDialog .editButton").on("click",vehicleModalEdit);
	$("#addVehicleDialog").on("show.bs.modal",vehicleAddModalOpens);

});
/*------------Funciones del manejo de viajes---------------*/
function loadLastTravels(){
	$.post(URLs.travelList)
		.done(function(d,s){
			console.log(d);
			d = JSON.parse(d);
			addLastTravels(d);
		})
		.fail(onFailPost)
}
function addLastTravels(d){
	$.get('mustacheTemplates/lastTravelsTemplate.mst', function(template) {
//    $('#target').html(rendered);
		for(var i = 0; i< d.length; i++){
			var rendered = Mustache.render(template, d[i]);
			$("#lastTravelsContainer ul").append(rendered);
		}
  });
}
function travelListItemClick(){
	$("#travelInfoModal").modal("show");
}
/*------------Funciones del manejo de vehiculos------------*/
function Configure(){
	$(".fa-spinner").hide();
	$("#modifyVehicleDialog .fa-spinner").show();
	$("#modifyVehicleDialog .editButton").hide();
	$("#modifyVehicleDialog form").hide();
	$("#modifyVehicleDialog input, #modifyVehicleDialog textarea").attr("disabled", "true");
	$("#modifyVehicleDialog input, #modifyVehicleDialog textarea").removeAttr("value");
	showSpinner();
	loadLastTravels();
}
function vehicleAddModalOpens(){
	$("#addVehicleDialog input, #addVehicleDialog textarea").val("");
}
function vehicleModalEdit(e){
	$("#modifyVehicleDialog input, #modifyVehicleDialog textarea").removeAttr("disabled");
	$("#modifyVehicleDialog .modal-title").text("Modificar vehículo");
}
function vehicleInfoButtonClicked(e){
	$("#modifyVehicleDialog .editButton").hide();
	$("#modifyVehicleDialog form").hide();
	$("#modifyVehicleDialog .fa-spinner").show();
	$("#modifyVehicleDialog").modal("show");
	setTimeout(function(){
		$("#modifyVehicleDialog .fa-spinner").hide();
		$("#modifyVehicleDialog .editButton, #modifyVehicleDialog form").fadeIn(200);
	},3000);
}

function showSpinner(){
	dialog = bootbox.dialog({
		closeButton: false,
		message: '<p><i class="fa fa-spin fa-spinner"></i>Verificando...</p>'
	});
}
function hideSpinner(){
	bootbox.hideAll()
}
function setDialogText(s){
	dialog.find('.bootbox-body').html(s);
}
function onFailPost(e){
	showSpinner();
	setDialogText("Se perdió la conexión con el servidor");
}
