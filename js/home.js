$(document).ready(function(){
	Configure();
	/*------------Eventos generales------------*/
	$("#optionsContainer .option").on("click", function(e){
		const s = $(this).attr("data-target");
		setTimeout(function(){window.scrollTo(0, $(s).position().top - 100);},500);
		return e;
	});
	/*------------Eventos del manejo de viajes------------*/
	$("#seachInput").on("focus", travelsOnSearchFocus);
	/*------------Eventos del manejo de vehiculos------------*/
	$("#vehiclesContainer .infoButton").on("click",vehicleInfoButtonClicked);
	$("#modifyVehicleDialog .editButton").on("click",vehicleModalEdit);
	$("#addVehicleDialog").on("show.bs.modal",vehicleAddModalOpens);
	
});
/*------------Funciones del manejo de viajes---------------*/
function travelsOnSearchFocus(){
	$("#travelsContainer").slideDown(200);
}
/*------------Funciones del manejo de vehiculos------------*/
function Configure(){
	$(".fa-spinner").hide();
	$("#modifyVehicleDialog .fa-spinner").show();
	$("#modifyVehicleDialog .editButton").hide();
	$("#modifyVehicleDialog form").hide();
	$("#modifyVehicleDialog input, #modifyVehicleDialog textarea").attr("disabled", "true");
	$("#modifyVehicleDialog input, #modifyVehicleDialog textarea").removeAttr("value");
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
