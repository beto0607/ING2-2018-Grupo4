
function loadCalifications(){
  $.post(URLs.califications,{id:userID})
  .done(function(d){
    d = parseJSON(d);
    reputation = d;
    $.get("mustacheTemplates/calification.mst", function(template){
      $("#reputationContainer ul").empty();
      console.log(d);
      for(var i in d){
        if(userID != d[i].idUsuarioCalifica && userID != d[i].IdUsuarioCalificado){continue;}
        d[i].dateFormatted = new Date(d[i].fechaCalificacion).toLocaleString();
        d[i].mine = d[i].idUsuarioCalifica == userID ? "mineCalification" : "otherCalification";
        d[i].mineCalification = d[i].idUsuarioCalifica == userID;
        d[i].calification = d[i].calificacion == 1 ? "Positivo" : d[i].calificacion == -1 ? "Negativo" : "Neutral";
        d[i].mineTravel = getTravel(d[i].idViaje).idUsuario == userID;

        var output = Mustache.render(template, d[i]);

        $("#reputationContainer ul").append(output);
      }
      if($("#reputationContainer ul li").length == 0){
        $("#reputationContainer ul").append("<li class='calificationItem'>Sin calificaciones</li>");
      }
      infoLoaded("reputation");
    });
  })
  .fail(onFailPost);
}
