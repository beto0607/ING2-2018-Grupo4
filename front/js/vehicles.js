var vehicles;
function ConfigureVehiclesEvents(){
  $("#addVehicleDialog").on("show.bs.modal",vehicleAddModalOpens);
  $("#modifyVehicleDialog").on("show.bs.modal",vehicleEditModalOpens);

  $("#buttonDeleteVehicle").on("click", vehicleDeteleButton);

  $("#modifyVehicleDialog .editButton").on("click", vehicleEditButton);

  $("#modifyVehicleDialog #buttonSaveVehicle").on("click", vehicleModifySubmit);
  $("#addVehicleDialog button.saveVehicle").on("click", vehicleAddSubmit);

  $("#vehiclesContainer .infoButton").on("click",vehicleInfoButtonClicked);
  
}
/*****************INFO***********************/
function vehicleInfoButtonClicked(){
	var vID = $(this).parent().parent().attr("vehicle-id");
	$("#modifyVehicleDialog").attr("vehicle-id", vID);
	var v = getVehicle(vID);
	var form = $("#modifyVehicleDialog form");
	setInputValue(form, "modify-vehicle-domain", v.dominio);
	setInputValue(form, "modify-vehicle-brand", v.marca);
	$("textarea[name=\"modify-vehicle-desc\"]").val(v.descripcion);
	setInputValue(form, "modify-vehicle-size", parseInt(v.plazas));
	setInputValue(form, "modify-vehicle-model", v.modelo);
	$("#modifyVehicleDialog").modal("show");
}
/*****************LOAD***********************/
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
          ConfigureVehiclesEvents();
				});
				vehicles = d;
			}catch(e){
			}
		})
		.fail(onFailPost);
}

/****************EDIT*******************/
function vehicleModifySubmit(){
  bConfirmCallbacks("¿Desea guardar los cambios?",function(r){
    if(!r){return;}
    $("#modifyVehicleForm").submit();
  });
}
function vehicleModalEdit(e){
	$("#modifyVehicleDialog input, #modifyVehicleDialog textarea").removeAttr("disabled");
	$("#modifyVehicleDialog .modal-title").text("Modificar vehículo");
}

function vehicleEditModalOpens(){
  $("#modifyVehicleDialog input, #modifyVehicleDialog textarea").attr("disabled", "true");
  $("#modifyVehicleDialog input, #modifyVehicleDialog textarea").removeAttr("value");
}
function vehicleEditButton(e){
	$("#modifyVehicleDialog input, #modifyVehicleDialog textarea").removeAttr("disabled");
	$("#modifyVehicleDialog .modal-title").text("Modificar vehículo");
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
/****************ADD*******************/
function vehicleAddModalOpens(){$("#addVehicleDialog input, #addVehicleDialog textarea").val("");}
function vehicleAddSubmit(){
	bConfirmCallbacks("¿Desea agregarel vehículo?",function(r){
		if(!r){return;}
		$("#addVehicleForm").submit();
	});
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
/****************REMOVE*******************/
function vehicleDeteleButton(){
	bConfirmCallbacks("¿Desea eliminar el vehículo?", deleteVehicle)
}
function deleteVehicle(r){
	if(!r){return;}
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
/****************MISC*******************/
function existsVehicle(id){
	if(id){
		for(var v in vehicles){
			if(vehicles[v].id == id){return true;}
		}
	}
	return false;
}
function getVehicle(id){
	for(var i = 0; i<vehicles.length; i++){
		if(id == vehicles[i].id){
			return vehicles[i];
		}
	}
	return null;
}
