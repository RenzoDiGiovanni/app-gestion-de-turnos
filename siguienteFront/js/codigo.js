window.fn = {};
var db = window.openDatabase("Favs", "1.0", "Favoritos", 1024 * 1024 * 5, crearTablas);
var secciones = "";
var datosSuper = "";
var turnosPedidos = [];
var supermercadoSeleccionado;
var idFav = "";

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
        case "qr":
            $("#btnQR").click(scanQR);
            $("#btnIngresar").click(datoTres);
            $("#btnFavoritos").click(function () {
                document.getElementById('content').load("favoritos.html");
            });
            break;

        case "supermercado":
            mostrarSecciones();
            recargar();
            $("#btnHacerFavorito").click(hacerFav);
            $("#btnBorrarFavorito").click(borrarFav);
            $(".volverQR").click(volverInicio);
            break;

        case "favoritos":
            mostrarFavoritos();
            $(".volverQR2").click(volverInicio);
    }
}

function volverInicio() {
    document.getElementById('content').load("qr.html");
}

function datoTres() {
    supermercadoSeleccionado = $("#codigoSuper").val();
    cambioPag();
}

function cambioPag() {
    supermercadoSeleccionado = parseInt(supermercadoSeleccionado);
    $.ajax({
        url: "http://cda2020.develotion.com/apps/siguiente_app/supermercados.php",
        type: "GET",
        dataType: "JSON",
        data: {
            accion: "listar",
            superElegido: supermercadoSeleccionado

        },
        success: cambio,
        error: x
    });
}

function cargarSecciones() {
    $.ajax({
        url: "http://cda2020.develotion.com/apps/siguiente_app/supermercados.php",
        type: "GET",
        dataType: "JSON",
        data: {accion: "listar"},
        success: mostrarSecciones
    });
}

function cambio(respuesta) {
    secciones = respuesta;
    if (secciones.length >= 1) {
        document.getElementById('content').load("supermercado.html");
    } else {
        $("#mensaje").text("Datos incorrectos");
    }
}
function mostrarSecciones() {
    $.ajax({
        url: "http://cda2020.develotion.com/apps/siguiente_app/supermercados.php",
        type: "GET",
        dataType: "JSON",
        data: {accion: "detalleSupermercado",
            superElegido: supermercadoSeleccionado},
        success: mostrarTitulo
    });
    $("#listaSecciones").empty();
    $("#nombreSupermercado").empty();
}

function mostrarTitulo(respuesta) {
    datosSuper = respuesta;
    $("#nombreSupermercado").append("<h1 class='cadena'>" + datosSuper[0].cadena + "</h1>");
    $("#nombreSupermercado").append("<h2 class='nombre'>" + datosSuper[0].nombre + "</h2>");
    $("#btnHacerFavorito").append("favorite_border");
    $("#btnBorrarFavorito").append("favorite");

    if (datosSuper[0].nombreImagen === "") {
        $(".titYfav").css("background-image", " linear-gradient(to bottom, rgba(0,0,0,0) 20%, rgba(0,0,0,.75) 100%), url('https://cda2020.develotion.com/apps/siguiente_app/imgs/fotoDefecto.jpg')");
    } else {
        $(".titYfav").css("background-image", " linear-gradient(to bottom, rgba(0,0,0,0) 20%, rgba(0,0,0,.75) 100%),url('https://cda2020.develotion.com/apps/siguiente_app/" + datosSuper[0].nombreImagen) + "') linear-gradient(top, #333 0%,#222 100%)";
    }

    for (var i = 0; i < secciones.length; i++) {

        var adelante = secciones[i].numeroPedido - secciones[i].numeroSeccion;
        tiempoPromedio = secciones[i].totalDiferencias / secciones[i].numeroSeccion;

        var tiempoEstimado = adelante * tiempoPromedio;
        tiempoEstimado = Math.trunc(tiempoEstimado);

        $("#listaSecciones").append("<div class='card' id='" + secciones[i].id + "'><div class='card__content'>" + "<div class='contenedorSeccion'><div class='cont1'><p class='turnoSeccion' id=num" + secciones[i].id + "> " + secciones[i].numeroSeccion + "</p></div>" + "<div class='datosSeccion'><h2 class='tituloSeccion'>" + secciones[i].nombreSeccion + " </h2><br><br><br><br><span class='material-icons'>query_builder</span><p id=tiempo" + secciones[i].id + "> " + tiempoEstimado + "'</p><span class='material-icons'>person_outline</span><p id=faltan" + secciones[i].id + "> " + adelante + "</p></div></div> <input type='button' class='pedir button button--material' value='Pedir Turno' id='" + secciones[i].id + "'></div> </div>");
    }

    $(".pedir").click(turno);

    db.transaction(listarTareasSql, errorTns, tareasListadas);
    function listarTareasSql(tx) {
        tx.executeSql("SELECT * FROM favoritos WHERE idSuper=" + datosSuper[0].id, [], armarListaTareas);
    }
    function tareasListadas() {
        
    }
    function armarListaTareas(tx, resultados) {
        if (resultados.rows.length === 0) {
            $("#btnHacerFavorito").show();
            $("#btnBorrarFavorito").hide();
        } else {
            $("#btnHacerFavorito").hide();
            $("#btnBorrarFavorito").show();
        }
    }
}
function turno() {
    $(this).hide();
    acutalizarNumeros();
    var id = $(this).attr("id");

    for (var i = 0; i < secciones.length; i++) {
        if (secciones[i].id === id) {
            var lugar = i;
        }
    }

    var seccionPedida = secciones[lugar].nombreSeccion;
    var numeroPedido = secciones[lugar].numeroPedido;
    var turnosCancelados = secciones[lugar].turnosCancelados;

    turnosPedidos.push({
        seccion: seccionPedida,
        numero: numeroPedido,
        turnosCancelados: turnosCancelados,
        id: id
    }
    );
    var adelante = numeroPedido - secciones[lugar].numeroSeccion;
    tiempoPromedio = secciones[lugar].totalDiferencias / secciones[lugar].numeroSeccion;
    var tiempoEstimado = adelante * tiempoPromedio;
    tiempoEstimado = Math.trunc(tiempoEstimado);

    $("div#" + id).append("<div class='contenedorCancelar'><p class='miTurno' id=turno" + id + " > Turno: " + numeroPedido + " </p> <input type='button' class='cancelar' value='X' id='" + id + "'> </div>");

    var numeroActual = secciones[lugar].numeroPedido;
    numeroActual = parseInt(numeroActual);
    var numeroMas = numeroActual + 1;

    $.ajax({
        url: "http://cda2020.develotion.com/apps/siguiente_app/supermercados.php",
        type: "PUT",
        dataType: "JSON",
        data: {
            id: id,
            numeroPedido: numeroMas,
            accion: "numeroPedidos"
        },
        success: acutalizarNumeros
    });
    $(".cancelar").click(cancelarTurno);
}

function acutalizarNumeros() {
    $.ajax({
        url: "http://cda2020.develotion.com/apps/siguiente_app/supermercados.php",
        type: "GET",
        dataType: "JSON",
        data: {
            accion: "listar",
            superElegido: supermercadoSeleccionado
        },
        success: mostrarNumeros
    });
}

function mostrarNumeros(respuesta) {
    secciones = respuesta;
    for (var i = 0; i < respuesta.length; i++) {
        var adelante = secciones[i].numeroPedido - secciones[i].numeroSeccion;
        tiempoPromedio = secciones[i].totalDiferencias / secciones[i].numeroSeccion;
        var tiempoEstimado = tiempoPromedio * adelante;
        tiempoEstimado = Math.trunc(tiempoEstimado);

        $("p#faltan" + secciones[i].id).html(adelante);
        $("p#tiempo" + secciones[i].id).html(tiempoEstimado + "'");
        $("p#num" + respuesta[i].id).html(respuesta[i].numeroSeccion);
    }
    comparar();
}

function comparar() {
    for (var i = 0; i < turnosPedidos.length; i++) {
        for (var e = 0; e < secciones.length; e++) {
            if (secciones[e].nombreSeccion === turnosPedidos[i].seccion) {
                if (secciones[e].numeroSeccion === turnosPedidos[i].numero) {
                    $("p#num" + secciones[e].id).html("<h2 class='tuTurno'>¡Es tu turno!</h2>");
                    $("p#faltan" + secciones[e].id).text("");
                    $("p#tiempo" + secciones[e].id).text("");
                    $("p#turno" + secciones[e].id).text("");
                    $("div#" + secciones[e].id + ".card").html("<p class='numeroPedido'>" + turnosPedidos[i].numero + "</p>" + "<div class='contenedorTurno'>" + "<p>" + secciones[e].nombreSeccion + "</p>" + "<h2 class='tuTurno'>¡Es tu turno!</h2>" + "</div>");
                    $("div#" + secciones[e].id + ".card").css("background-color", "#489a5d");
                    $("div#" + secciones[e].id + ".card").css("color", "white");
                } else {
                    var adelante = turnosPedidos[i].numero - secciones[e].numeroSeccion;
                    tiempoPromedio = secciones[e].totalDiferencias / secciones[e].numeroSeccion;
                    var tiempoEstimado = tiempoPromedio * adelante;
                    tiempoEstimado = Math.trunc(tiempoEstimado);

                    $("p#faltan" + secciones[e].id).html(adelante);
                    $("p#tiempo" + secciones[e].id).html(tiempoEstimado + "'");
                }
            }
        }
    }
}

function recargar() {
    var myVar = setInterval(acutalizarNumeros, 5000);
}

function mostrarFavoritos() {
    db.transaction(listarTareasSql, errorTns, tareasListadas);
    function listarTareasSql(tx) {
        tx.executeSql("SELECT * FROM favoritos ", [], armarListaTareas);
    }
    function tareasListadas() {
        
    }
    function armarListaTareas(tx, resultados) {
        $("#listaFavoritos").empty();
        for (var i = 0; i < resultados.rows.length; i++) {
            if (resultados.rows.item(i).nombreImagen === "") {
                $("#listaFavoritos").append("<div class='card' id=" + resultados.rows.item(i).idSuper + "> <div class='tamano'> <img src='https://cda2020.develotion.com/apps/siguiente_app/imgs/fotoDefecto.jpg'> </div> <h2 class='cadenaFav'>" + resultados.rows.item(i).cadena + "</h2> <h3 class='nombreFav'>" + resultados.rows.item(i).nombre + "</h3> <span class='material-icons ir' id='" + resultados.rows.item(i).idSuper + "'>exit_to_app</span> </div>");
            } else {
                $("#listaFavoritos").append("<div class='card' id=" + resultados.rows.item(i).idSuper + "> <div class='tamano'> <img src='https://cda2020.develotion.com/apps/siguiente_app/" + resultados.rows.item(i).nombreImagen + "'> </div> <h2 class='cadenaFav'>" + resultados.rows.item(i).cadena + "</h2> <h3 class='nombreFav'>" + resultados.rows.item(i).nombre + "</h3><span class='material-icons ir' id='" + resultados.rows.item(i).idSuper + "'>exit_to_app</span></div>");
            }
        }
        $(".ir").click(irPag);
    }
}

function irPag() {
    idFav = $(this).attr("id");
    supermercadoSeleccionado = idFav;

    cambioPag();
}
function x() {

}

function cancelarTurno() {
    var id = $(this).attr("id");
    for (var i = 0; i < turnosPedidos.length; i++) {
        if (turnosPedidos[i].id === id) {
            var lugar = i;
            $(this).hide();
            $("input#" + turnosPedidos[i].id + ".pedir").show();
        }
    }

    var numerosCancelados = turnosPedidos[lugar].turnosCancelados;
    var turno = turnosPedidos[lugar].numero;
    var numbers = numerosCancelados.split(',');
    numbers.push(turno);

    numerosCancelados = numbers.join(',');
    turnoCancelado();

    $.ajax({
        url: "http://cda2020.develotion.com/apps/siguiente_app/supermercados.php",
        type: "PUT",
        dataType: "JSON",
        data: {
            id: id,
            cancelados: numerosCancelados,
            accion: "cancelar"
        },
        success: x
    });

    function turnoCancelado() {
        for (var i = 0; i < secciones.length; i++) {
            if (secciones[i].id === id) {
                var lugarSecc = i;
            }
        }

        var seccionPedida = secciones[lugarSecc].nombreSeccion;
        var numeroPedido = secciones[lugarSecc].numeroPedido;
        var turnosCancelados = secciones[lugarSecc].turnosCancelados;

        turnosPedidos.splice(lugar, 1);

        $("p#turno" + secciones[lugarSecc].id).html("");
        $("p#turno" + secciones[lugarSecc].id).html("");
    }

}
function scanQR() {
    cordova.plugins.barcodeScanner.scan(
            function (result) {
                continuar(result.text);
            },
            function (error) {
                ons.notification.toast("Error durante escaneo " + error, {"timeout": 3000});
            },
            {
                preferFrontCamera: false, // iOS and Android
                showFlipCameraButton: true, // iOS and Android
                showTorchButton: true, // iOS and Android
                torchOn: false, // Android, launch with the torch switched on (if available)
                saveHistory: true, // Android, save scan history (default false)
                prompt: "Escanee el codigo QR", // Android
                resultDisplayDuration: 1000, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                formats: "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
                orientation: "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
                disableAnimations: true, // iOS
                disableSuccessBeep: false // iOS and Android
            }
    );
}

function continuar(res) {
    supermercadoSeleccionado = res;
    cambioPag();
}

function crearTablas() {
    db.transaction(crearTablasSql, errorTns, exitoCrearTablas);
}

function crearTablasSql(tx) {
    tx.executeSql("CREATE TABLE IF NOT EXISTS favoritos (id INTEGER PRIMARY KEY, idSuper INTEGER(255), nombre VARCHAR(255), cadena VARCHAR(255), nombreImagen VARCHAR(255))");
}

function errorTns(e) {

}

function exitoCrearTablas() {

}

function hacerFav() {
    $("#btnHacerFavorito").hide();
    $("#btnBorrarFavorito").show();
    db.transaction(agregarNombreSql, errorTns, agregarNombreFinalizado);
}
function borrarFav() {
    $("#btnHacerFavorito").show();
    $("#btnBorrarFavorito").hide();
    db.transaction(borrarNombreSql, errorTns, agregarNombreFinalizado);
}
function agregarNombreSql(tx) {
    tx.executeSql("INSERT INTO favoritos (idSuper,nombre,cadena,nombreImagen) VALUES (?,?,?,?)", [supermercadoSeleccionado, datosSuper[0].nombre, datosSuper[0].cadena, datosSuper[0].nombreImagen]);
}
function borrarNombreSql(tx) {
    tx.executeSql('DELETE FROM favoritos WHERE idSuper = ?', [supermercadoSeleccionado]);
}

function agregarNombreFinalizado() {}