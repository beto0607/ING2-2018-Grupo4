var URLs = {
	travelsList:"../index.php?c=viajes&a=Listar&debug=1",
	travelAdd:"../index.php?c=viaje&a=Guardar&debug=1",

	vehiclesList:"../index.php?c=vehiculo&a=Listar&debug=1",
	vehiclesRemove:"../index.php?c=vehiculo&a=Eliminar&debug=1",
	vehiclesAdd:"../index.php?c=vehiculo&a=Guardar&debug=1",
	vehiclesModify:"../index.php?c=vehiculo&a=Guardar&debug=1",

	userInfo: "../index.php?c=usuario&a=Obtener&debug=1",
	userInfoSave: "../index.php?c=usuario&a=Guardar&debug=1"
};
var loadItems = {
	//"userTravels": false,
	"travelsList": false,
	"vehiclesList": false,
	"userInfo": false
};
var userID = getCookie("userID");
var username = "";
var userJSON;
var vehicles = null;
$(document).ready(function(){
	userID = getCookie("userID");
	if(!userID || userID == ""){goToIndex();}
	Configure();
	/*------------Eventos generales------------*/
	$("#optionsContainer .option").on("click", function(e){
		const s = $(this).attr("data-target");
		if(s == "#vehiclesContainer"){
			$("#vehiclesContainer .infoButton").on("click",vehicleInfoButtonClicked);
		}
		$("div.infoContainer").hide();
		$(s).show();
		//setTimeout(function(){window.scrollTo(0, $(s).position().top - 100);},500);
		return e;
	});
	$("#signoutButton").on("click", signoutClick);
	/*------------Eventos del manejo de user data------------*/
	$("#buttonSaveUserInfo").on("click", userInfoSubmit);
	$("#userInfoModal .editButton").on("click", userInfoInputClick);
	/*------------Eventos del manejo de viajes------------*/
	$(".travelListItem").on("click", travelListItemClick);

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
function signoutClick(e){
	setCookie("userID", "", 1);
	$.post(URLs.signout)
		.done(function(){
			bAlertCallback("Cerraste sesión", goToIndex);
		})
}
function loadUserInfo(){
	$.post(URLs.userInfo, {'id': userID})
		.done(function(d,s){
			try{
				console.log(d);
				d = parseJSON(d);
				userJSON = d;
				$("div.reputationContainer span strong")[0].innerHTML = (d.calificacionPiloto);
				$("div.reputationContainer span strong")[1].innerHTML = (d.calificacionCopiloto);
				$("#userInfoModal input[name=\"user-info-firstname\"]").val(d.nombre);
				$("#userInfoModal input[name=\"user-info-lastname\"]").val(d.apellido);
				$("#userInfoModal input[name=\"user-info-date\"]").val(d.fechaNacimiento);
				$("#userInfoModal input[name=\"user-info-phone\"]").val(d.telefono);
				$("#userInfoModal input[name=\"user-info-email\"]").val(d.email);
				$("#userInfoModal input[name=\"user-info-username\"]").val(d.usuario);
				$("#userInfoModal input[name=\"user-info-cbu\"]").val(d.cbu);
				username = d.usuario;
				$("#addTravelCBU").val(d.cbu);
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
	$("#userInfoModal input.inputDisabled").removeAttr("disabled");
	$("#userInfoModal .modal-title").text("Modificar datos");
}
function userInfoValidateForm(){
	$("#userInfoModal form").validate({
		onfocusout: false,
		rules: {
			"user-info-firstname": {
				required: true
			},
			"user-info-lastname": {
				required: true
			},
			"user-info-date": {
				required: true
			},
			"user-info-phone": {
				required: true
			},
			"user-info-cbu": {
				required: true,
				maxlength: 22,
				minlength: 22,
				pattern: /^[0-9]{22}$/
			}
		},
		submitHandler: function(){
			bConfirmCallbacks("¿Desea guardar los cambios?", userInfoSave);
		}
		//submitHandler:userInfoSave
	});
}
function userInfoSubmit(){
	$("#userInfoModal form").submit();
}
function userInfoSave(r){
	if(!r){return;}
	var form = $("#userInfoModal form");

	var data = {};
	data["id"] = userID;
	data["Usuario"] = username;
	data["nombre"] = getInputValue(form, "user-info-firstname");
	data["apellido"] = getInputValue(form, "user-info-lastname");
	data["fechaNacimiento"] = getInputValue(form, "user-info-date").split("-").join('');
	data["telefono"] = getInputValue(form, "user-info-phone");
	data["cbu"] = getInputValue(form, "user-info-cbu");
	if($("#userInfoModal").attr("user-info-modify")!="true"){return;}//Si no hubo cambios, retorno
	showSpinner();
	$.post(URLs.userInfoSave, data)
		.done(function(d,s){
			hideSpinner();
			try {
				d = parseJSON(d);
				if(d.success == "ok" || d.success == "1"){
					reloadPage();
				}else{
					bAlert(d.mensaje);
				}
			} catch (e) {
				console.log(d);
				console.log(e);
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
function getVehicle(id){
	for(var i = 0; i<vehicles.length; i++){
		if(id == vehicles[i].id){
			return vehicles[i];
		}
	}
	return null;
}
function vehicleInfoButtonClicked(){
	var vID = $(this).parent().parent().attr("vehicle-id");
	$("#modifyVehicleDialog").attr("vehicle-id", vID);
	var v = getVehicle(vID);
	var form = $("#modifyVehicleDialog form");
	console.log(v);
	setInputValue(form, "modify-vehicle-domain", v.dominio);
	setInputValue(form, "modify-vehicle-brand", v.marca);
	$("textarea[name=\"modify-vehicle-desc\"]").val(v.descripcion);
	setInputValue(form, "modify-vehicle-size", parseInt(v.plazas));
	setInputValue(form, "modify-vehicle-model", v.modelo);
	$("#modifyVehicleDialog").modal("show");
//	$("#modifyVehicleDialog").
}
function loadVehicles(){
	$.post(URLs.vehiclesList, {'idUsuario': userID})
		.done(function(d,s){
			try{
				d = parseJSON(d);
				$.get('mustacheTemplates/homeVehicles.mst', function(template) {
					$("#addTravelVehiclesSelect").empty();
					$("#addTravelVehiclesSelect").append('<option value="-1">Seleccionar vehículo</option>');
					for(var i = 0; i< d.length; i++){
						var rendered = Mustache.render(template, d[i]);
						$("#vehiclesContainer tbody").append(rendered);
						$("#addTravelVehiclesSelect").append(
							'<option value="'+d[i].id+'">'+d[i].dominio+' - '+d[i].marca+' - '+d[i].modelo+'</option>'
						);
					}
					infoLoaded("vehiclesList");
				});
				vehicles = d;
				ConfigureVehicles();
			}catch(e){
				console.log(e);
				console.log(d);
			}
		})
		.fail(onFailPost);
}
function DeleteVehicleConfirmation(){
	bConfirmCallbacks("¿Desea eliminar el vehículo?", deleteVehicle)
}
function deleteVehicle(){
	var vID = $("#modifyVehicleDialog").attr("vehicle-id");
	if(!vID){return;}
	$.post(URLs.vehiclesRemove, {id: vID, idUsuario: userID})
		.done(function(d,s){
			console.log(d);
			d = parseJSON(d);
			if(d.success == "1" || d.success == "ok"){
				bAlertCallback("Vehículo eliminado correctamente.", reloadPage);
			}else{
				bAlertCallback(""+d.mensaje, reloadPage);
			}
		})
		.fail(onFailPost);
}
function vehicleModifySubmit(){
	$("#modifyVehicleForm").submit();
}
function vehicleModifyValidateForm(){
	$("#modifyVehicleForm").validate({
		onfocusout: false,
		rules: {
			"modify-vehicle-domain": {
				required: true
			},
			"modify-vehicle-brand": {
				required: true
			},
			"modify-vehicle-desc": {
				required: true
			},
			"modify-vehicle-model": {
				required: true
			},
			"modify-vehicle-size": {
				required: true,
				min:1
			}
		},
		submitHandler:modifyVehicle
	});
}
function modifyVehicle(){
	var form = $("#modifyVehicleDialog form");
	var data = {
		dominio: getInputValue(form, "modify-vehicle-domain"),
		marca: getInputValue(form, "modify-vehicle-brand"),
		descripcion: $("textarea[name=\"modify-vehicle-desc\"]").val(),
		plazas: getInputValue(form, "modify-vehicle-size"),
		modelo: getInputValue(form, "modify-vehicle-model"),
		id: $("#modifyVehicleDialog").attr("vehicle-id"),
		idUsuario: userID
	};
	$.post(URLs.vehiclesModify, data)
		.done(function(d,s){
			console.log(d);
			d = parseJSON(d);
			if(d.success == "ok" || d.success == "1"){
				bAlertCallback("Vehículo modificado.", reloadPage);
			}else{
				bAlertCallback(d.mensaje, reloadPage);
			}
		})
		.fail(onFailPost);
}
function vehicleAddSubmit(){
	$("#addVehicleForm").submit();
}
function vehicleAddValidateForm(){
	$("#addVehicleForm").validate({
		onfocusout: false,
		rules: {
			"add-vehicle-domain": {
				required: true
			},
			"add-vehicle-brand": {
				required: true
			},
			"add-vehicle-desc": {
				required: true
			},
			"add-vehicle-model": {
				required: true
			},
			"add-vehicle-size": {
				required: true,
				min:1
			}
		},
		submitHandler:addVehicle
	});
}
function addVehicle(){
	var form = $("#addVehicleDialog form");
	var data = {
		dominio: getInputValue(form, "add-vehicle-domain"),
		marca: getInputValue(form, "add-vehicle-brand"),
		descripcion: $("textarea[name=\"add-vehicle-desc\"]").val(),
		plazas: getInputValue(form, "add-vehicle-size"),
		modelo: getInputValue(form, "add-vehicle-model"),
		idUsuario: userID
	};
	$.post(URLs.vehiclesAdd, data)
		.done(function(d,s){
			console.log(d);
			d = parseJSON(d);
			if(d.success == "1" || d.success == "ok"){
				bAlert("Vehículo agregado.", reloadPage);
			}else{
				bAlert(d.mensaje, reloadPage);
			}
		})
		.fail(onFailPost);
}
/*---------------------Funciones-------------------------------*/
function addTravelSubmit(){
	$("#addTravelForm").submit();
}
function travelAddValidateForm(){
	var duration = $("#addTravelDuration").val();
	console.log(duration);
	$("#addTravelForm").validate({
		onfocusout: false,
		rules: {
			"add-travel-vehicles": {
				required: true
			},
			"add-travel-size": {
				required: true
			},
			"add-travel-origen": {
				required: true
			},
			"add-travel-destino": {
				required: true
			},
			"add-travel-date": {
				required: true
			},
			"add-travel-hour": {
				required: true
			},
			"add-travel-cbu": {
				required: true
			},
			"add-travel-monto": {
				required: true,
				min: 1
			},
			"add-travel-desc": {
				required: true
			},
			"add-travel-type":{
				required: true
			},
			"add-travel-till-date":{
				required: true
			},
		},
		submitHandler:addTravel
	});
}
function addTravel(){
	var duration = $("#addTravelDuration").val();
	console.log(duration);

	if(cbu ==""){
		bAlert("Debe ingresar un CBU, desde \"Mi Perfil\"");
		return;
	}

	var form = $("#addTravelForm");
	var date = getInputValue(form, "add-travel-date").split("-").join("");
	date += " " + getInputValue(form, "add-travel-hour");
	var dateTill = getInputValue(form,"add-travel-type") == "O" ?
		date :
		getInputValue(form, "add-travel-till-date") + " " + getInputValue(form, "add-travel-hour");
	var data = {
		idUsuario: userID,
		idVehiculo: getInputValue(form, "add-travel-vehicles"),
		plazas: getInputValue(form, "add-travel-size"),
		origen: getInputValue(form, "add-travel-origen"),
		destino: getInputValue(form, "add-travel-destino"),
		fecha: date,
		tipoAlta: dateTill,
		descripcion: $("textarea[name=\"add-travel-desc\"]").val()
	}
	$.post(URLs.travelAdd, data)
		.done(function(d,s){
			d= parseJSON(d);
			if(d.success == "1"){
				bAlertCallback("Viaje creado.", reloadPage);
			}else{
				bAlertCallback(""+d.mensaje, reloadPage);
			}
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
function ConfigureVehicles(){
	$("#modifyVehicleDialog input, #modifyVehicleDialog textarea").attr("disabled", "true");
	$("#modifyVehicleDialog input, #modifyVehicleDialog textarea").removeAttr("value");
	/*------------Eventos del manejo de vehiculos------------*/
//	$("#vehiclesContainer .infoButton").on("click",vehicleInfoButtonClicked);
	$("#modifyVehicleDialog .editButton").on("click",vehicleModalEdit);
	$("#addVehicleDialog").on("show.bs.modal",vehicleAddModalOpens);

	$("#modifyVehicleDialog #buttonSaveVehicle").on("click", vehicleModifySubmit);
	$("#addVehicleDialog button.saveVehicle").on("click", vehicleAddSubmit);
	$("#buttonDeleteVehicle").on("click", DeleteVehicleConfirmation);
}
function ConfigureTravels(){
	$("#addTravelVehiclesSelect").on("change",function(){
		var vID = ($(this).val());
		if(vID == "-1"){
			$("#addTravelForm input[name=\"add-travel-size\"]").attr("disabled", "true");
		}else{
			$("#addTravelForm input[name=\"add-travel-size\"]").removeAttr("disabled");
			var v = getVehicle(vID);
			console.log(v);
			$("#addTravelForm input[name=\"add-travel-size\"]").attr("max", v.plazas);
		}
	});
	$("#addTravelTypeSelect").on("change",function(){
		if($(this).val() != "O"){
			$("#addTravelTillRow input").removeAttr("disabled");
		}else{
			$("#addTravelTillRow input").attr("disabled","true");
		}
	});
	$("#buttonSaveTravel").on("click", addTravelSubmit);
	$("#addTravelForm input[name=\"add-travel-size\"]").attr("disabled", "true");
	$("#addTravelTillRow input").attr("disabled","true");
	$("#addTravelDuration").on("change",function(){
		var h = Math.floor($(this).val());
		var m = $(this).val() - h;
		$("#addTravelDurationTime").text(h+"hs "+(m*60)+"m");
	});
}
function Configure(){
	configureValidatorMessages();
	$(".fa-spinner").hide();

	showSpinner();
	loadLastTravels();
	loadVehicles();
	loadUserInfo();

	vehicleAddValidateForm();
	vehicleModifyValidateForm();
	userInfoValidateForm();
	travelAddValidateForm();


	ConfigureTravels();
}
function setInputValue(form, input, v){
	return $(form).find("input[name=\""+input+"\"]").val(v);
}
function getInputValue(form, input){
	return $(form).find("input[name=\""+input+"\"]").val();
}
function isInputEnabled(form, input){
	return $(form).find("input[name=\""+input+"\"]").attr("disabled") == undefined;
}
