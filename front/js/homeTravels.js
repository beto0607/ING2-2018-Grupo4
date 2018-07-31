/*------------Funciones del manejo de viajes---------------*/
function loadLastTravels(){
	$.post(URLs.travelsList)
		.done(function(d,s){
			d = parseJSON(d);
			travels = d;
			addTravels(d);
			$.post(URLs.travelsFor, {idUsuario: userID})
				.done(addMyTravels)
		})
		.fail(onFailPost)
}
function getTravel(id){
	for(var t in travels){
		if(id == travels[t].idViaje){
			return travels[t];
		}
	}
	return false;
}
function getTravelsWherePilot(id){
	var _t = [];
	for(var t in travels){
		if(id == travels[t].idUsuario){
			_t.push(travels[t]);
		}
	}
	return _t;
}
function addMyTravels(d){
	$("#myTravelsContianer ul").empty();
	$.get('mustacheTemplates/travelsTravel.mst', function(template) {
		d = parseJSON(d);
		var myT = getTravelsWherePilot(userID);
		for(var i = 0; i<d.length; i++){
			var t = getTravel(d[i].idViaje);
			if(t){
				myT.push(t);
			}
		}
		//myT = orderTravels(myT);
		for(var i = 0; i<myT.length; i++){
			var t = myT[i];
			var date = new Date(t.fecha);
			t["dateFormatted"] = date.toLocaleString();
			t["isMine"] = userID == t.idUsuario;
			var rendered = Mustache.render(template, t);
			$("#myTravelsContainer ul").append(rendered);
		}
		infoLoaded("travelsFor");

		$(".editTravel").on("click",myTravelInfo);
		$(".travelListItem").on("click", travelClick);

	});
}
function myTravelInfo(){
	$("#travelInfoModal").modal("hide");
	var tID = $(this).attr("travel-id");
	var travelUserID = $(this).attr("travel-userid");
	var travel = getTravel(tID);
	if(travel.isMine){
		$.get("./mustacheTemplates/homeMyTravelEdit.mst", function(t){
			travel["vehicles"] = vehicles;
			travel["duracionString"] = travel["duracion"].split(":")[0]+"h "+ travel["duracion"].split(":")[1]+"m";
			travel["duracionFlotante"] = parseFloat(travel["duracion"].split(":")[0])+ (parseFloat(travel["duracion"].split(":")[1])/60);

			var date = new Date(travel["fecha"]);
			travel["dateStart"] = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
			travel["hourStart"] = date.toLocaleTimeString();

			console.log(travel);
			$("#myTravelEditModal .modal-body").empty();
			var output = Mustache.render(t, travel);
			$("#myTravelEditModal .modal-body").append(output);
			if(travel["fechaCancelacion"] != null){
				$("#buttonEditTravel").attr("disabled", "true");
			}
			$("#myTravelEditModal").modal("show");
			$("#editTravelVehiclesSelect").on("change",function(){
				var vID = ($(this).val());
				if(vID == "-1"){
					$("#editTravelForm input[name=\"edit-travel-size\"]").attr("disabled", "true");
				}else{
					$("#editTravelForm input[name=\"edit-travel-size\"]").removeAttr("disabled");
					var v = getVehicle(vID);
					$("#editTravelForm input[name=\"edit-travel-size\"]").attr("max", v.plazas);
				}
			});
			$("#addTravelTypeSelect").on("change",function(){
				if($(this).val() != "O"){
					$("#addTravelTillRow input").removeAttr("disabled");
				}else{
					$("#addTravelTillRow input").attr("disabled","true");
				}
			});
			$("#linkToMoreInfoEditTravel").attr("href", "travels.html?travel="+travel.idViaje);
			$("#editTravelVehiclesSelect").val(travel.idVehiculo);
		});
	}else{
		changeLocation("travels.html?travel="+tID);
	}
}
function addTravels(d){
	$("#lastTravelsContainer ul").empty();
	$.get('mustacheTemplates/travelsTravel.mst', function(template) {
		for(var i = 0; i< d.length; i++){
			var t = d[i];
			if(t.fechaCancelacion != null){continue;}
			var date = new Date(t.fecha);
			t["dateFormatted"] = date.toLocaleString();
			t["isMine"] = userID == t.idUsuario;
			if(date >= new Date()){
				var rendered = Mustache.render(template, t);
				$("#lastTravelsContainer ul").append(rendered);
			}
		}
		if($("#lastTravelsContainer ul li").length == 0){
			$("#lastTravelsContainer ul").append("<li class='emptyList'><strong>Todavía no publicaron viajes</strong></li>");
		}
		$("li.travelListItem").on("click", travelClick);
		infoLoaded("travelsList");
  });
}
function travelListItemClick(){

	//changeLocation("./travels.html?travel="+$(this).attr("travel-id"))
}
function ConfigureTravels(){
	$("#addTravelVehiclesSelect").on("change",function(){
		var vID = ($(this).val());
		if(vID == "-1"){
			$("#addTravelForm input[name=\"add-travel-size\"]").attr("disabled", "true");
		}else{
			$("#addTravelForm input[name=\"add-travel-size\"]").removeAttr("disabled");
			var v = getVehicle(vID);
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
	$("#buttonEditTravel").on("click", editTravelSubmit);
	$("#addTravelForm input[name=\"add-travel-size\"]").attr("disabled", "true");
	$("#addTravelTillRow input").attr("disabled","true");
	$("#addTravelDuration").on("change",function(){
		var h = Math.floor($(this).val());
		var m = $(this).val() - h;
		$("#addTravelDurationTime").text(h+"hs "+(m*60)+"m");
	});
}
function editTravelSubmit(){
	travelEditValidateForm();
	$("#editTravelForm").submit();
}
function travelEditValidateForm(){
	$("#editTravelForm").validate({
		onfocusout: false,
		rules:{
			"edit-travel-vehicles": {
				required: true
			},
			"edit-travel-size": {
				required: true
			},
			"edit-travel-cbu": {
				required: true
			},
			"edit-travel-monto": {
				required: true,
				min: 1
			},
			"edit-travel-desc": {
				required: true
			}
		},
		submitHandler: editTravel
	});
}
function editTravel(){

	var form = $("#editTravelForm");
	var t = getTravel($(form).attr("travel-id"));
	if(!t){
		bAlertCallback("Ocurrió un error. Recargaremos la web.", reloadPage);
	}
	if(!getInputValue(form, "edit-travel-cbu")){
		bAlert("Debe ingresar un CBU.");
		return;
	}
	var duration = parseFloat($("#editTravelDuration").val());
	if(duration <= 0){
		bAlert("Debe ingresar una duración válida.");
		return;
	}
	var dHours = Math.floor(duration)
	duration = (dHours <10 ? "0": "")+ dHours.toString() +":"+  (((duration - dHours) * 60)< 10 ? "0" : "" )+((duration - dHours) * 60).toString() +":00";

	if(!existsVehicle($("#editTravelVehiclesSelect").val())){
		bAlert("Debe seleccionar un vehículo o agregar uno desde \"Mis vehículos\".");
		return;
	}

	var data = {
		idViaje: $(form).attr("travel-id"),
		idUsuario: userID,
		idVehiculo: $("#editTravelVehiclesSelect").val(),
		plazas: getInputValue(form, "edit-travel-size"),
		origen: t.origen,
		destino: t.destino,
		fecha: t.fecha,
		descripcion: $("textarea[name=\"edit-travel-desc\"]").val(),
		montoTotal: getInputValue(form, "edit-travel-monto"),
		duracion: duration,
		cbu: getInputValue(form, "edit-travel-cbu")
	};
	console.log(data);
	bConfirmCallbacks("¿Desea realizar las modificaciones?",
	function(r){
		if(!r){return;}
		$.post(URLs.travelEdit, data)
		.done(function(d,s){
			console.log(d);
			d= parseJSON(d);
			if(d.success == "1"){
				bAlertCallback("Viaje modificado.", reloadPage);
			}else{
				bAlert(""+d.mensaje);
			}
		})
		.fail(onFailPost);
	});
}
function addTravelSubmit(){
	$("#addTravelForm").submit();
}
function travelAddValidateForm(){
	var duration = $("#addTravelDuration").val();
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
			}
		},
		submitHandler:addTravel
	});
}
function addTravelCheckDates(form){
	var today = new Date();
	var startDate = new Date(getInputValue(form, "add-travel-date") + "T" +getInputValue(form, "add-travel-hour"));
	var endDate = new Date(getInputValue(form, "add-travel-date-end") + "T" +getInputValue(form, "add-travel-hour"));
	return	startDate > today && (endDate > startDate || $("#addTravelTypeSelect").val() == "O");
}
function addTravel(){
	var form = $("#addTravelForm");

	if(!getInputValue(form, "add-travel-cbu")){
	//if(!userJSON.cbu){
		bAlert("Debe ingresar un CBU, desde \"Mi Perfil\"");
		return;
	}
	var duration = parseFloat($("#addTravelDuration").val());
	if(duration <= 0){
		bAlert("Debe ingresar una duración válida.");
		return;
	}
	var dHours = Math.floor(duration)
	duration = (dHours <10 ? "0": "")+ dHours.toString() +":"+  (((duration - dHours) * 60)< 10 ? "0" : "" )+((duration - dHours) * 60).toString() +":00";

	if(!addTravelCheckDates(form)){
		bAlert("Debe ingresar fechas y horas de inicio y fin válidas.");
		return;
	}
	if(!existsVehicle($("#addTravelVehiclesSelect").val())){
		bAlert("Debe seleccionar un vehículo o agregar uno desde \"Mis vehículos\".");
		return;
	}
	var travelType = $("#addTravelTypeSelect").val();
	var date = getInputValue(form, "add-travel-date").split("-").join("");
	date += " " + getInputValue(form, "add-travel-hour").split(":").join("")+"00";

	var dateTill = travelType == "O" ?
		date :
		getInputValue(form, "add-travel-date-end").split("-").join("")
		+ " " + getInputValue(form, "add-travel-hour").split(":").join("")+"00";
	var data = {
		idUsuario: userID,
		idVehiculo: $("#addTravelVehiclesSelect").val(),
		plazas: getInputValue(form, "add-travel-size"),
		origen: getInputValue(form, "add-travel-origen"),
		destino: getInputValue(form, "add-travel-destino"),
		fecha: date,
		tipoAlta: travelType,
		descripcion: $("textarea[name=\"add-travel-desc\"]").val(),
		montoTotal: getInputValue(form, "add-travel-monto"),
		duracion: duration,
		cbu: getInputValue(form, "add-travel-cbu"),
		fechaHasta: dateTill
	};
	console.log(data);
	$.post(URLs.travelAdd, data)
		.done(function(d,s){
			console.log(d);
			d= parseJSON(d);
			if(d.success == "1"){
				bAlertCallback("Viaje creado.", reloadPage);
			}else{
				bAlert(""+d.mensaje);
			}
		})
		.fail(onFailPost);
}
