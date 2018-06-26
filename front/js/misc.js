var dialog;
function bAlert(s){
	bootbox.alert(s);
}
function bAlertCallback(s, c){
	bootbox.alert(s,c);
}
function bConfirmCallbacks(s, c){
	bootbox.confirm(s,function(r){
		console.log(r);
		c(r);
	});
}
function showSpinner(){
	dialog = bootbox.dialog({
		closeButton: false,
		message: '<p><i class="fa fa-spin fa-spinner"></i>Verificando...</p>'
	});
}
function hideSpinner(){
	setTimeout(function(){dialog.modal('hide');}, 500);
}
function setDialogText(s){
	dialog.find('.bootbox-body').html(s);
}
function setCookie(name,value,hours) {
    var expires = "";
    if (hours) {
        var date = new Date();
        date.setTime(date.getTime() + (hours*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function reloadPageTravel(){
	changeLocation(travelInfo != null && travelInfo.idViaje ? "travels.html?travel="+travelInfo.idViaje : "travels.html");
}
function reloadPage(t =500){
	setTimeout(function(){
		window.location.reload();
	},t);
}
function goToIndex(){
	changeLocation("index.html");
}
function changeLocation(s,t= 500){
	setTimeout(function(){
		window.location.replace(s);
	},t);
}
function parseJSON(d){
	try{d = JSON.parse(d);}
	catch(e){
		console.log(d);
		d = d.substr(1, d.length-1);
		d = JSON.parse(d);
	}
	return d;
}
function configureValidatorMessages(){
	jQuery.validator.addMethod("pattern", function(value, element) {
		return value.match($(element).attr("pattern"));
    //return this.optional(element) || (parseFloat(value) > 0);
	}, "Debe ingresar solo números.");
	jQuery.extend(jQuery.validator.messages, {
		required: "Campo obligatorio.",
		email: "E-mail inválido.",
		number: "Debe ingresar un número.",
		equalTo: "Los campos son diferentes.",
		min: jQuery.validator.format("Ingresa un valor mayor a {0}."),
		max: jQuery.validator.format("Ingresa un valor menor o igual a {0}."),
		minlength: jQuery.validator.format("Debe ingresar {0} caracteres como mínimo."),
		maxlength: jQuery.validator.format("Debe ingresar {0} caracteres como máximo.")
	});
}
function onFailPost(e){
	hideSpinner();
	bAlert("Se perdió la conexión con el servidor", reloadPage);
}
function orderTravels(d){
  d.sort(function(a,b){
		return -1*( new Date(a.fechaCreacion) - new Date(b.fechaCreacion));
    //return -1*( parseInt(a.idViaje) - parseInt(b.idViaje));
  });
  return d;
}
function isPostulant(){
	if(travelInfo.postulations == false){return false;}
	for(var cop in travelInfo.postulations){
		cop =travelInfo.postulations[cop];
		if(cop.id == userID){return true;}
	}
	return false;
}
function isCopilot(){
	if(travelInfo.copilots == false){return false;}
	for(var cop in travelInfo.copilots){
		cop =travelInfo.copilots[cop];
		if(cop.id == userID){return true;}
	}
	return false;
}
