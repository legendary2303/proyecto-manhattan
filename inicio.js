var mapa,marcador,centro;

$(document).ready(function () {
    $("#cargando").fadeOut("slow");
    cargaalumnos();



$("#btn-guardar").click( function() {
	$.ajax({
		"url" : appData.uri_ws+"backend/actualizaalumno",
		"dataType" : "json",
		"type" : "post",
		"data" : {
			"accion" : "cambio",
			"matricula" : appData.matricula,
			"latitud" : marcador.getPosition().lat(),
			"longitud" : marcador.getPosition().lng()
		}
	}).done(function(obj){
		$("#btn-guardar").prop("disabled",true);
		alert(obj.resultado ? "success" : "danger",obj.mensaje);

	}).fail(error_ajax);
})


}); // Fin del $.ready()

// FUNCIONES EXTERNAS
function cargaalumnos(){
    $("#tabla-alumnos")
        .find("thead")
        .hide();

    $.ajax({
        "url"      : appData.uri_ws + "backend/alumnos",
        "dataType" : "json"
    })
    .done(function(obj) {
        if(obj.resultado){
            $("#tabla-alumnos")
            .find("thead")
            .show();

            $("#tabla-alumnos")
                .find("tbody")
                .html("");

            $.each(obj.alumnos, function(i, a){
                $("#tabla-alumnos")
                    .find("tbody")
                    .append(
                        '<tr id="tr-' + a.matricula + '">' +
                        '<td class="text-center">' + a.matricula + '</td>' +
                        '<td>' + a.appaterno + ' ' + a.apmaterno + ' '  + a.nombre + '</td>' +
                        '<td class="text-center">' + a.sexo + '</td>' +
                        '<td class="text-center">' + a.edad + '</td>' +
                        '<td class="text-center">'+
						'<button class="btn btn-sm btn-info me-2" ' +
						'onclick="click_btn_mapa(\''+a.matricula+'\',\''+a.appaterno+' '+a.apmaterno+' '+a.nombre+'\')" title="mapa/a">' +
						'<i class="fas fa-earth-americas fa-2x" data-bs-toggle="modal" data-bs-target="#modal-mapa"></i></button>'+
                        '</td>' +
                        '</tr>'
					);
			});

            if($("#mensaje").find(".alert").length == 0)
                alert("info", obj.mensaje);
        } 
        else{
            alert("warning", obj.mensaje);
        }
    })
    .fail( error_ajax );
}



function inicioMapa(){

	if (navigator.geolocation) {

		navigator.geolocation.getCurrentPosition( function(pos){
			centro = {
				lat : pos.coords.latitude,
				lng : pos.coords.longitude
			};
	mapa = new google.maps.Map(
		document.getElementById("mapa"),
			{
				center: centro,
				zoom: 15
			}
			);

			if ( typeof marcador === "undefined") {
				mapa.addListener("click",click_listener);
			}
		});
	}else{
		alert("danger","tu navegador no permite geolocalizacion");
	}
}


function click_btn_mapa(matricula,nomalumno){
	appData.matricula= matricula;
	$("#modal-mapa-titulo").html(nomalumno);


	if ( !(typeof marcador === "undefined") ) {
		marcador.setMap(null);
		marcador=null;
	}

	mapa.setZoom(15);
	mapa.setCenter(centro);

	$.ajax({
		"url" : appData.uri_ws+"backend/alumno",
		"dataType" : "json",
		"type" : "post",
		"data" : {
			"matricula" : appData.matricula
		}
	}).done( function(obj){
		if (obj.resultado) {
			

			if (!(typeof obj.alumno.latitud === "null" && obj.alumno.longitud === "null")) {
				marcador =  new google.maps.Marker({
						position: {
							lat : parseFloat(obj.alumno.latitud),
							lng : parseFloat(obj.alumno.longitud)
						},
						map: mapa,
						icon: "http://maps.google.com/mapfiles/kml/pal2/icon2.png",
						draggable: true
					});
					marcador.addListener("drag",function(){
						$("#btn-guardar").prop("disabled",false);
					});
					mapa.panTo(marcador.getPosition());
					
			}else{
				mapa.addListener("click",click_listener);
			}
		}
	}).fail(error_ajax);

}

function click_listener(e){
	marcador =  new google.maps.Marker({
						position: e.latLng,
						map: mapa,
						icon: "http://maps.google.com/mapfiles/kml/pal2/icon2.png",
						draggable: true
					});
					marcador.addListener("drag",function(){
						$("#btn-guardar").prop("disabled",false);
					});
					google.maps.event.clearListeners(mapa,"click");
					$("#btn-guardar").prop("disabled",false);
}