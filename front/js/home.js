var URLs = {
	travelsList:"../index.php?c=viajes&a=Listar&debug=1",
	travelAdd:"../index.php?c=viaje&a=Guardar&debug=1",
	travelEdit:"../index.php?c=viaje&a=Guardar&debug=1",
	travelsFor: "../index.php?c=viajes&a=ViajesUsuario&debug=1",

	vehiclesList:"../index.php?c=vehiculo&a=Listar&debug=1",
	vehiclesRemove:"../index.php?c=vehiculo&a=Eliminar&debug=1",
	vehiclesAdd:"../index.php?c=vehiculo&a=Guardar&debug=1",
	vehiclesModify:"../index.php?c=vehiculo&a=Guardar&debug=1",

	userInfo: "../index.php?c=usuario&a=Obtener&debug=1",
	userInfoSave: "../index.php?c=usuario&a=Guardar&debug=1",
	userDelete: "../index.php?c=usuario&a=EliminarUsuario&debug=1",

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

	travelSendQuestion:"../index.php?c=viaje&a=EnviarMensaje&debug=1",
	travelSendAnswer:"../index.php?c=viaje&a=ResponderMensaje&debug=1",

	travelCalificatePilot: "../index.php?c=viaje&a=CalificarPiloto&debug=1",
	travelCalificateCopilot: "../index.php?c=viaje&a=CalificarCopiloto&debug=1",
	travelCalifications: "../index.php?c=viaje&a=ObtenerCalificaciones&debug=1",

	travelPay: "../index.php?c=viaje&a=Pagar&debug=1"
};
var loadItems = {
	"travelsFor": false,
	"travelsList": false,
	"vehiclesList": false,
	"userInfo": false
};
var userID = getCookie("userID");
var username = "";
var userJSON;
var travels;
$(document).ready(function(){
	userID = getCookie("userID");
	if(!userID || userID == ""){goToIndex();}
	Configure();
	/*------------Eventos generales------------*/
	$("a.option").on("click", function(e){
		const s = $(this).attr("data-target");
		console.log(s);
		setTimeout(function(){window.scrollTo(0, $(s).position().top - 150);},250);
		return e;
	});
	$("#signoutButton").on("click", signoutClick);
	/*------------Eventos del manejo de user data------------*/
	//$("#buttonSaveUserInfo").on("click", userInfoSubmit);
	$("#userInfoModal .editButton").on("click", userInfoInputClick);
	/*------------Eventos del manejo de viajes------------*/
	$(".travelListItem").on("click", travelListItemClick);

	$("#removeUsuario").on("click", deleteUserButtonClick);
	$("button.goUp").on("click",function(){
		window.scrollTo(0, 0);
	});
});


/*---------------------Funciones-------------------------------*/
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

	ConfigureTravelsEvents();
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
