var URLs = {
	login:"../index.php?c=auth&a=Autenticar",
	signup:"../index.php?c=usuario&a=Guardar&debug=1"
};

var dialog;
function registerLinkTap(){
	window.scroll(0, $("#registerSection").position().top - 100);
}
function signinFormValidator(){
	$('#signinForm').validate({
		onfocusout: false,
		rules: {
			"login-email": {
				required: true
			},
			"login-password": {
				required: true
			}
		},
		messages:{
			"login-email":{required:"Nombre de usuario obligatorio."},
			"login-password":{required:"Contraseña obligatorio."}
		},
		submitHandler: signinFormValid
	});
}
function showSpinner(){
	dialog = bootbox.dialog({
		closeButton: false,
		message: '<p><i class="fa fa-spin fa-spinner"></i>Verificando...</p>'
	});
}
function getInputValue(form, input){
	return $(form).find("input[name=\""+input+"\"]").val();
}
function signinFormValid(form){
	showSpinner();
var data = {
	usuario: getInputValue(form, "login-email"),
	password:getInputValue(form, "login-password")
};
	$.post(URLs.login, data).done(function(d,s){
		console.log(d);
		dialog.find('.bootbox-body').html('Login');
	}).fail(function(e){
		dialog.find('.bootbox-body').html('Error - '+e.statusExit);
	});
}

function signupFormValid(form){
	showSpinner();
	var data = {
		"Usuario": 					getInputValue(form, "signup-username"),
		"clave": 						getInputValue(form, "signup-password"),
		"nombre": 					getInputValue(form, "signup-firstname"),
		"apellido": 				getInputValue(form, "signup-lastname"),
		"fechaNacimiento": 	getInputValue(form, "signup-date"),
		"telefono": 				getInputValue(form, "signup-phone"),
		"email": 						getInputValue(form, "signup-email")
	};
}
function signupFormValidator(){
	$("#signupForm").validate({
		onfocusout: false,
		submitHandler: signupFormValid,
		rules: {
			"signup-email": {
				required: true,
				email: true
			},
			"signup-username": {
				required: true
			},
			"signup-password": {
				required: true,
				equalTo : "#signup-repassword"
			},
			"signup-repassword": {
				required: true,
				equalTo : "#signup-password"
			},
			"signup-firstname": {
				required: true
			},
			"signup-lastname": {
				required: true
			},
			"signup-phone": {
				required: true
			},
			"signup-date": {
				required: true
			},
			"signup-termsCheck": {
				required: true
			}
		},
		messages:{
			"signup-email": {
				required: "Email obligatorio",
				email: "Email inválido"
			},
			"signup-username": {
				required: "Nombre de usuario obligatorio"
			},
			"signup-password": {
				required: "Contraseña obligatoria",
				equalTo : "Las contraseñas no coinciden"
			},
			"signup-repassword": {
				required: "Repetir contraseña obligatoria",
				equalTo : "Las contraseñas no coinciden"
			},
			"signup-firstname": {
				required: "Campo obligatorio"
			},
			"signup-lastname": {
				required:"Campo obligatorio"
			},
			"signup-phone": {
				required: "Campo obligatorio"
			},
			"signup-date": {
				required: "Campo obligatorio"
			},
			"signup-termsCheck": {
				required: "<i style=\"font-size: 1.5em;\" class=\"fas fa-times\"></i>"
			}
		}
	})
}



$(document).ready(function(){
$('#signTabs a[href="#signin"]').tab('show');
	$("#registerLink").on("click", registerLinkTap);

	if(window.location.href.indexOf("#registerSection") != -1){
		registerLinkTap();
	}
	signinFormValidator();
	signupFormValidator();


	$("#loginSubmit").on("click",function(e){
		e.preventDefault();
		$("#signinForm input[required]");
		$("#signinForm").submit();
	});
});
