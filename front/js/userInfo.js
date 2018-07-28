/*------------Funciones del manejo de userInfo------------*/
function deleteUserButtonClick(){
	bConfirmCallbacks("¿Seguro que desea eliminar el usuario? No podrá volver a utilizarlo", function(r){
		if(!r){return;}
		bConfirmCallbacks("¿Totalmente seguro que desea eliminar el usuario?",deleteUserSubmit);
	});
}
function deleteUserSubmit(r){
	if(!r){return;}
	$.post(URLs.userDelete, {idUsuario: userID})
		.done(function(d,s){
			if(parseJSON(d).success="1"){
				bAlertCallback("Fue un placer... :'-( ", goToIndex);
			}
		})
		.fail(onFailPost);
}
function signoutClick(e){
	setCookie("userID", "", 1);
	$.post(URLs.signout)
		.done(function(){
			bAlertCallback("Cerraste sesión", goToIndex);
		})
		.fail(onFailPost);
}
function loadUserInfo(){
	$.post(URLs.userInfo, {'id': userID})
		.done(function(d,s){
			try{
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
	$("#userInfoModal #buttonSaveUserInfo").on("click", userInfoSubmit);
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
	return false;
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
