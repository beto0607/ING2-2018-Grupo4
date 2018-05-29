var URLs = {
	travelsList:"../index.php?c=viaje&a=Listar&debug=1",

	vehiclesList:"../index.php?c=vehiculo&a=Listar&debug=1",
	vehiclesRemove:"../index.php?c=vehiculo&a=Eliminar&debug=1",
	vehiclesModify:"../index.php?c=vehiculo&a=Guardar&debug=1",

	userInfo: "../index.php?c=usuario&a=Obtener&debug=1",
	userInfoSave: "../index.php?c=usuario&a=Guardar&debug=1"
};
var loadItems = {
	"travelsList": false,
	"vehiclesList": false,
	"userInfo": false,
	//"userTravels": false
};
var userID = getCookie("userID");
var vehicles = null;
$(document).ready(function(){
	Configure();
	/*------------Eventos generales------------*/
	$("#optionsContainer .option").on("click", function(e){
		const s = $(this).attr("data-target");
		setTimeout(function(){window.scrollTo(0, $(s).position().top - 100);},500);
		return e;
	});
	/*------------Eventos del manejo de user data------------*/
	$("#buttonSaveUserInfo").on("click", userInfoSave);
	$("#userInfoModal .editButton").on("click", userInfoInputClick);
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
/*------------Funciones del manejo de userInfo------------*/
function loadUserInfo(){
	$.post(URLs.userInfo, {'id': userID})
		.done(function(d,s){
			try{
				console.log(d);
				d = parseJSON(d);
				console.log(d);
				$("div.reputationContainer span strong")[0].innerHTML = (d.calificacionPiloto);
				$("div.reputationContainer span strong")[1].innerHTML = (d.calificacionCopiloto);
				$("#userInfoModal input[name=\"user-info-firstname\"]").val(d.nombre);
				$("#userInfoModal input[name=\"user-info-lastname\"]").val(d.apellido);
				$("#userInfoModal input[name=\"user-info-date\"]").val(d.fechaNacimiento);
				$("#userInfoModal input[name=\"user-info-phone\"]").val(d.telefono);
				infoLoaded("userInfo");
			}catch(e){
				console.log(e);
				console.log(d);
			}
		})
		.fail(onFailPost);
}
function userInfoInputClick(e){
	$("#userInfoModal").attr("user-info-modify", "true");
	$("#userInfoModal #buttonSaveUserInfo").removeClass("disabled");
	$("#userInfoModal input").removeAttr("disabled");
	$("#userInfoModal .modal-title").text("Modificar datos");
}
function userInfoSave(){
	var form = $("#userInfoModal form");
	var data = {};
	data["nombre"] = getInputValue(form, "user-info-firstname");
	data["apellido"] = getInputValue(form, "user-info-lastname");
	data["fechaNacimiento"] = getInputValue(form, "user-info-date").split("-").join('');
	data["telefono"] = getInputValue(form, "user-info-phone");
	if($("#userInfoModal").attr("user-info-modify")!="true"){return;}//Si no hubo cambios, retorno
	showSpinner();
	$.post(URLs.userInfoSave, data)
		.done(function(d,s){
			hideSpinner();
			try {
				console.log(d);
				d = parseJSON(d);
				if(d.status == "ok" || d.status == "1"){
					reloadPage();
				}else{
					bAlert(d.error);
				}
			} catch (e) {
				bAlert("Ocurrió un error.");
			}
		})
		.fail(onFailPost);
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
	$("#modifyVehicleDialog").modal("show");
}
function loadVehicles(){
	$.post(URLs.vehiclesList, {'idUsuario': userID})
		.done(function(d,s){
			try{
				d = parseJSON(d);
				$.get('mustacheTemplates/homeVehicles.mst', function(template) {
					for(var i = 0; i< d.length; i++){
						var rendered = Mustache.render(template, d[i]);
						$("#vehiclesContainer tbody").append(rendered);
					}
					infoLoaded("vehiclesList");
				});
				vehicles = d;
			}catch(e){
				console.log(e);
				console.log(d);
			}
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
			bAlert("Vehículo eliminado", reloadPage);
		})
		.fail(onFailPost);
}
/*---------------------Funciones-------------------------------*/
function onFailPost(e){
	hideSpinner();
	bAlert("Se perdió la conexión con el servidor", reloadPage);
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
	loadUserInfo();
}
function getInputValue(form, input){
	return $(form).find("input[name=\""+input+"\"]").val();
}
function isInputEnabled(form, input){
	return $(form).find("input[name=\""+input+"\"]").attr("disabled") == undefined;
}
