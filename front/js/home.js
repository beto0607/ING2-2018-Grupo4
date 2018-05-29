var URLs = {
	travelsList:"../index.php?c=viaje&a=Listar&debug=1",
	vehiclesList:"../index.php?c=vehiculo&a=Listar&debug=1",
	vehiclesRemove:"../index.php?c=vehiculo&a=Eliminar&debug=1",
	vehiclesModify:"../index.php?c=vehiculo&a=Guardar&debug=1"
};
var dialog;
var loadItems = {
	"travelsList": false,
	"vehiclesList": false,
	"userInfo": false,
	"userTravels": false
}
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
	$.post(URLs.travelsList)
		.done(function(d,s){
			d = JSON.parse(d);
			addLastTravels(d);
		})
		.fail(onFailPost)
}
function addLastTravels(d){
	$("#lastTravelsContainer ul").empty();
	$.get('mustacheTemplates/homeTravels.mst', function(template) {
		for(var i = 0; i< d.length; i++){
			var rendered = Mustache.render(template, d[i]);
			$("#lastTravelsContainer ul").append(rendered);
		}
		infoLoaded("travelsList");
  });
}
function travelListItemClick(){
	$("#travelInfoModal").modal("show");
}
/*------------Funciones del manejo de vehiculos------------*/
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
function loadVehicles(){
	$.post(URLs.vehiclesList)
		.done(function(d,s){
			d = JSON.parse(d);
			$.get('mustacheTemplates/homeVehicles.mst', function(template) {
				for(var i = 0; i< d.length; i++){
					var rendered = Mustache.render(template, d[i]);
					$("#vehiclesContainer tbody").append(rendered);
				}
				infoLoaded("vehiclesList");
			});
		})
		.fail(onFailPost);
}
function deleteVehicle(){
	var vID = $("#modifyVehicleDialog").attr("vehicle-id");
	if(!vID){return;}
	showSpinner();
	$.post(URLs.vehiclesRemove, {id: vID})
		.done(function(d,s){
			location.reload();
		})
		.fail(onFailPost);
}
function modifyVehicle(){
	var vID = $("#modifyVehicleDialog").attr("vehicle-id");
	if(!vID){return;}
	showSpinner();
	$.post(URLs.vehiclesRemove, {id: vID})
		.done(function(d,s){
			location.reload();
		})
		.fail(onFailPost);
}
function addVehicle(){
	var form = $("#modifyVehicleDialog form");
	var data = {
		dominio: getInputValue(form, "add-vehicle-domain"),
		marca: getInputValue(form, "add-vehicle-brand"),
		descripcion: getInputValue(form, "add-vehicle-desc"),
		plazas: getInputValue(form, "add-vehicle-size"),
		modelo: getInputValue(form, "add-vehicle-model"),
		id: $(form).attr("vehicle-id"),
		idUsuario: userId
	};
	showSpinner();
	$.post(URLs.vehiclesRemove, data)
		.done(function(d,s){
			location.reload();
		})
		.fail(onFailPost);
}
/*---------------------Funciones-------------------------------*/
function showSpinner(){
	dialog = bootbox.dialog({
		closeButton: false,
		message: '<p><i class="fa fa-spin fa-spinner"></i>Verificando...</p>'
	});
}
function hideSpinner(){
	setTimeout(bootbox.hideAll, 500);
}
function setDialogText(s){
	dialog.find('.bootbox-body').html(s);
}
function onFailPost(e){
	showSpinner();
	setDialogText("Se perdió la conexión con el servidor");
}
function infoLoaded(item){
	loadItems[item] = true;
	var t = true;
	var k = Object.keys(loadItems);
	for(var i = 0; i<k.length; i++){
		t = t && loadItems[k];
	}
	if(t){
		hideSpinner();
	}
}
function Configure(){
	$(".fa-spinner").hide();
	$("#modifyVehicleDialog .fa-spinner").show();
	$("#modifyVehicleDialog .editButton").hide();
	$("#modifyVehicleDialog form").hide();
	$("#modifyVehicleDialog input, #modifyVehicleDialog textarea").attr("disabled", "true");
	$("#modifyVehicleDialog input, #modifyVehicleDialog textarea").removeAttr("value");
	showSpinner();
	loadLastTravels();
	loadVehicles();
}
function getInputValue(form, input){
	return $(form).find("input[name=\""+input+"\"]").val();
}
