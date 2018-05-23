function registerLinkTap(){
	window.scroll(0, $("#registerSection").position().top - 100);
	$('#signTabs a[href="#signin"]').tab('show');
}





$(document).ready(function(){

	$("#registerLink").on("click", registerLinkTap);

	if(window.location.href.indexOf("#registerSection") != -1){
		registerLinkTap();
	}

	$("#loginSubmit").on("click",function(e){
		e.preventDefault();
		window.location.replace("home.html");

	});
});