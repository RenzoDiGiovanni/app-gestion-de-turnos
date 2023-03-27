var secciones = "";
var supermercadoSeleccionado = "";
var lugar = "";
var diferencia = "";
var horaTotal = "";
var horaActual = "";
window.fn = {};

window.fn.open = function () {
    var menu = document.getElementById('menu');
    menu.open();
};
window.fn.load = function (page) {
    var content = document.getElementById('content');
    var menu = document.getElementById('menu');
    content.load(page)
            .then(menu.close.bind(menu));
};

document.addEventListener("init", inicializarPagina);

function inicializarPagina(evt) {
    var destino = evt.target.id;
    $(".barra").hide();
    switch (destino) {
        case "home":
            $("#btnIngresar").click(cambioPag);
            $("#btnRegistrar").click(registrar);
            break;

        case "registrar":
            $("#btnRegistro").click(registrarNuevo);
            $(".volverHome").click(volveraEmpezar);
            break;

        case "principal":
            cargarInfo();
            recargar();
            $("#btnAgregaTres").click(agregadisimo);
            $("#btnCrearQR").click(crearQR);
            $(".volverHome").click(volveraEmpezar);
    }
}

function volveraEmpezar() {
    document.getElementById('content').load("home.html");
}

function cambioPag() {
    var user = $("#txtUsuarioDos").val();
    var pass = $("#txtContrasena").val();
    $.ajax({
        url: "http://cda2020.develotion.com/apps/siguiente_app/supermercados.php",
        type: "GET",
        dataType: "JSON",
        data: {
            accion: "ingresar",
            userData: user,
            passData: pass
        },
        success: cargarData,
        error: mensajeError
    });
    supermercadoSeleccionado = $("#codigoSuper").val();
    supermercadoSeleccionado = parseInt(supermercadoSeleccionado);
}

function cargarData(info) {
    supermercadoSeleccionado = info.id;
    document.getElementById('content').load("principal.html");
    $.ajax({
        url: "http://cda2020.develotion.com/apps/siguiente_app/supermercados.php",
        type: "GET",
        dataType: "JSON",
        data: {
            accion: "listar",
            superElegido: supermercadoSeleccionado
        },
        success: mostrarSecciones
    });
}
function mensajeError() {
    $("#mensaje").text("Datos incorrectos");
}
function registrar() {
    document.getElementById('content').load("registrar.html");
}
function siguiente() {

    var id = $(this).attr("data-id");

    for (var i = 0; i < secciones.length; i++) {
        if (secciones[i].id === id) {
            lugar = i;
        }
    }
    actualizarHora();
    var numeroActual = secciones[lugar].numeroSeccion;
    numeroActual = parseInt(numeroActual);
    var ultimoPedido = secciones[lugar].numeroPedido;
    var numeroMas = numeroActual;
    if (numeroActual <= ultimoPedido - 2) {
        numeroMas = numeroActual + 1;
    } else {
        alert("No hay nadie mas esperando por ahora.");
    }
    verificarCancelados();

    function verificarCancelados() {
        var numerosCancelados = secciones[lugar].turnosCancelados;
        if (numerosCancelados.includes(numeroMas)) {
            numeroMas = numeroMas + 1;
            verificarCancelados();
        } else {
            $.ajax({
                url: "http://cda2020.develotion.com/apps/siguiente_app/supermercados.php",
                type: "PUT",
                dataType: "JSON",
                data: {
                    id: id,
                    numeroSeccion: numeroMas,
                    horaActual: horaActual,
                    diferencia: horaTotal,
                    accion: "numeroSecciones"
                },
                success: cargarSecciones
            });
        }
    }
}
;
function anterior() {

    var id = $(this).attr("data-id");
    for (var i = 0; i < secciones.length; i++) {
        if (secciones[i].id === id) {
            var lugar = i;
        }
    }
    var numeroActual = secciones[lugar].numeroSeccion;
    numeroActual = parseInt(numeroActual);
    if (numeroActual > 0) {
        var numeroMenos = numeroActual - 1;
    } else {
        alert("No puede ser menor a 0");
    }

    $.ajax({
        url: "http://cda2020.develotion.com/apps/siguiente_app/supermercados.php",
        type: "PUT",
        dataType: "JSON",
        data: {
            id: id,
            numeroSeccion: numeroMenos,
            accion: "numeroSecciones"
        },
        success: cargarSecciones
    });
}
function reset() {

    var id = $(this).attr("data-id");
    var fechaNueva = new Date();

    $.ajax({
        url: "http://cda2020.develotion.com/apps/siguiente_app/supermercados.php",
        type: "PUT",
        dataType: "JSON",
        data: {
            id: id,
            nuevaFecha: fechaNueva,
            accion: "resetNumeros"
        },
        success: cargarSecciones
    });
}

function cargarSecciones() {

    $.ajax({
        url: "http://cda2020.develotion.com/apps/siguiente_app/supermercados.php",
        type: "GET",
        dataType: "JSON",
        data: {
            accion: "listar",
            superElegido: supermercadoSeleccionado

        },
        success: mostrarSecciones
    });
}

function cargarInfo() {
    $.ajax({
        url: "http://cda2020.develotion.com/apps/siguiente_app/supermercados.php",
        type: "GET",
        dataType: "JSON",
        data: {accion: "detalleSupermercado",
            superElegido: supermercadoSeleccionado},
        success: mostrarInfo
    });
}

function mostrarInfo(respuesta) {
    datosSuper = respuesta;
    $("#nombreSupermercado").append("<h1 class='cadena'>" + datosSuper[0].cadena + "</h1>");
    $("#nombreSupermercado").append("<h2 class='nombre'>" + datosSuper[0].nombre + "</h2>");
    $("#nombreSupermercado").append("<p class='parrafoId'>ID Supemercado: " + datosSuper[0].id + "</p>");
}

function mostrarSecciones(respuesta) {
    secciones = respuesta;
    $("#listaSecciones").empty();
    for (var i = 0; i < respuesta.length; i++) {
        $("#listaSecciones").append("<div class='card panel'><div class='card__content'><input type='button' class='borrarSec cancelar' value='x' data-id='" + respuesta[i].id + "'><p class='listasTxt'>  " + respuesta[i].nombreSeccion + " - " + respuesta[i].numeroSeccion +
                "</p> <input type='button' class='resta button button--material' value='-' data-id='" + respuesta[i].id + "'> <input type='button' class='suma button button--material' value='+' data-id='" + respuesta[i].id + "'><input type='button' class='reset button button--material' value='reset' data-id='" + respuesta[i].id + "'></div></div>");
    }
    $(".resta").click(anterior);
    $(".suma").click(siguiente);
    $(".reset").click(reset);
    $(".borrarSec").click(eliminarSec);
}

function registrarNuevo() {

    var cadena = $("#txtCadena").val();
    var nombre = $("#txtNombre").val();
    var usuario = $("#txtUsuario").val();
    var contrasenia = $("#txtContrasenia").val();
    var files = $('#fileFoto')[0].files[0];

    var fd = new FormData();
    fd.append('file', files);
    fd.append('cadenaSuper', cadena);
    fd.append('nombreSuper', nombre);
    fd.append('usuario', usuario);
    fd.append('contra', contrasenia);

    if (cadena === "" || nombre === "" || usuario === "" || contrasenia === "") {
        $("#mensaje").text("Debes completar todos los campos");
    } else {
        $.ajax({
            url: "http://cda2020.develotion.com/apps/siguiente_app/upload.php",
            type: "POST",
            dataType: "JSON",
            data: fd,
            contentType: false,
            processData: false,
            success: SuperIngresado
        });
        document.getElementById('content').load("home.html");
    }
}

function SuperIngresado() {
    alert("bien!");
}
function agregadisimo() {

    var nombreSeccion = $("#nombreSeccion").val();
    var fechaNueva = new Date();
    $.ajax({
        url: "http://cda2020.develotion.com/apps/siguiente_app/supermercados.php",
        type: "POST",
        dataType: "JSON",
        data: {
            nombreSeccion: nombreSeccion,
            idSuper: supermercadoSeleccionado,
            nuevaFecha: fechaNueva,
            accion: "nuevaSeccion"
        },
        success: cargarSecciones
    });
    $("#nombreSeccion").val("");
}

function recargar() {
    var myVar = setInterval(cargarSecciones, 5000);
}

function eliminarSec() {
    var id = $(this).attr("data-id");
    $.ajax({
        url: "http://cda2020.develotion.com/apps/siguiente_app/supermercados.php",
        type: "DELETE",
        dataType: "JSON",
        data: {
            idEliminado: id
        },
        success: cargarSecciones
    });
}
function actualizarHora() {
    var totalAnterior = secciones[lugar].totalDiferencias;
    horaActual = new Date();
    var horaAnterior = new Date(secciones[lugar].ultimoMomento);

    diferencia = (horaActual.getTime() - horaAnterior.getTime()) / 1000;
    diferencia /= 60;
    diferencia = parseInt(diferencia);
    totalAnterior = parseInt(totalAnterior);
    horaTotal = totalAnterior + diferencia;
}
function crearQR() {
    var idQr = parseInt(supermercadoSeleccionado);
    crearCodigoQR(idQr);
}
function crearCodigoQR(idQR) {
    $("#dQR").empty();
    $("#dQR").qrcode({
        
        render: 'canvas',

        minVersion: 1,
        maxVersion: 40,

        ecLevel: 'L',

        left: 0,
        top: 0,

        size: 200,

        fill: '#000',

        background: null,

        text: idQR,

        radius: 0,

        quiet: 0,

        mode: 0,

        mSize: 0.1,
        mPosX: 0.5,
        mPosY: 0.5,

        label: 'no label',
        fontname: 'sans',
        fontcolor: '#000',

        image: null
    });
}