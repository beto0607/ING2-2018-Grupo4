function registerLinkTap(){
	window.scroll(0, $("#registerSection").position().top - 100);
	$('#signTabs a[href="#signin"]').tab('show');
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
function signinFormValid(form){
	var d = bootbox.dialog({
		closeButton: false,
		message: '<p><i class="fa fa-spin fa-spinner"></i>Verificando...</p>'
	});
	setTimeout(function(){
		d.find('.bootbox-body').html('Termine de cargar');
	},3000);
}
function signupFormValidator(){
	$("#signupForm").validate({
		onfocusout: false,
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

	$("#registerLink").on("click", registerLinkTap);

	if(window.location.href.indexOf("#registerSection") != -1){
		registerLinkTap();
	}
	signinFormValidator();
	signupFormValidator();


	$("#loginSubmit").on("click",function(e){
		e.preventDefault();
		//		window.location.replace("home.html");
		$("#signinForm input[required]");
		$("#signinForm").submit();
	});
});
