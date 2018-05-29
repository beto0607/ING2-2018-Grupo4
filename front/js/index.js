var URLs = {
	login:"../index.php?c=auth&a=Autenticar&debug=1",
	signup:"../index.php?c=usuario&a=Guardar&debug=1"
};
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
		hideSpinner();
		try{
			try{d = JSON.parse(" "+d);}
			catch(e){
				d = d.substr(1, d.length-1);
				d = JSON.parse(d);
				console.log(d);
			}
			if(d.status == "error"){
				bootbox.alert('Ocurrió un error: '+d.error)
			}else if(d.status == "ok"){
				setCookie("userID", d.userID, 1);
				setCookie("username", getInputValue(form, "login-email"), 1);
				setDialogText("Datos correctos")
				changeLocation("home.html", 1500);
		}}catch(e){
			console.log(e);
			console.log(d);
		}
	}).fail(function(e){
		dialog.find('.bootbox-body').html('Error - '+e.statusExit);
	});
}

function signupFormValid(form){
	var date = getInputValue(form, "signup-date").split('-').join('');
	showSpinner();
	var data = {
		"Usuario": 					getInputValue(form, "signup-username"),
		"clave": 						getInputValue(form, "signup-password"),
		"nombre": 					getInputValue(form, "signup-firstname"),
		"apellido": 				getInputValue(form, "signup-lastname"),
		"fechaNacimiento": 	date,//getInputValue(form, "signup-date"),
		"telefono": 				getInputValue(form, "signup-phone"),
		"email": 						getInputValue(form, "signup-email")
	};
	$.post(URLs.signup, data).
		done(function(d,s){
			hideSpinner();
			try{
				console.log(d);
				try{d = JSON.parse(" "+d);}
				catch(e){
					d[0] = ' ';
					d = JSON.parse(d);
				}

				//setDialogText(d.mensaje);
				bootbox.alert(d.mensaje);
				if(d.success == "1"){
					setCookie("userID", d.id, 1);
					setCookie("username", getInputValue(form, "signup-email"), 1);
					setTimeout(function(){
						window.location.replace("./home.html");
					}, 1000);
				}
			}catch(e){
				console.log(d);
				console.log(e);
			}
		}).fail(function(e){
			hideSpinner();
			bootbox.alert('Error - '+e.statusExit);
		});
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
function setDialogText(s){
	dialog.find('.bootbox-body').html(s);
}
