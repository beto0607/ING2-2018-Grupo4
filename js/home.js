$(document).ready(function(){
	$(".fa-spinner").hide();


	$("#vehiclesContainer .infoButton").on("click",vehicleInfoButtonClicked);
	$("#modifyVehicleDialog .editButton").on("click",vehicleModalEdit);
});

/*------------Configure Vehicles------------*/
function Configure(){
	$("#modifyVehicleDialog .fa-spinner").show();
	$("#modifyVehicleDialog form").hide();
	$("#modifyVehicleDialog input, #modifyVehicleDialog textarea").addAttr("disabled");
	$("#modifyVehicleDialog input, #modifyVehicleDialog textarea").removeAttr("value");
}
function vehicleModalEdit(e){
	$("#modifyVehicleDialog input, #modifyVehicleDialog textarea").removeAttr("disabled");
}
function vehicleInfoButtonClicked(e){
	$("#modifyVehicleDialog form").hide();
	$("#modifyVehicleDialog .fa-spinner").show();
	$("#modifyVehicleDialog").modal("show");
	setTimeout(function(){
		$("#modifyVehicleDialog .fa-spinner").hide();
		$("#modifyVehicleDialog form").fadeIn(200);
	},3000);
}
