<?php

require_once ("../../conexion.php");

$tipo = $_SERVER["REQUEST_METHOD"];


switch ($tipo) {
    case "DELETE":
        parse_str(file_get_contents("php://input"), $deleteDataS);
        $idEliminaTres = $deleteDataS["idEliminado"];
        $consulta_eliminar = "DELETE FROM `seccionessuper` WHERE `seccionessuper`.`id` = " . $idEliminaTres;
        $resultado_consulta = mysqli_query($db, $consulta_eliminar);
        $dev = array();
        http_response_code(200);
        $dev["mensaje"] = "Seccion eliminada con exito";
        $dev["codigo"] = 200;
        echo json_encode($dev);

        break;
    case "GET":

        $elegido = filter_input(INPUT_GET, "superElegido");
        $accion = filter_input(INPUT_GET, "accion");
        
        if ($accion === "detalleSupermercado") {
            $consultaSuper = "SELECT * FROM `listasuper` WHERE `listasuper`.`id` = " . $elegido;
            $resultadoSuper = mysqli_query($db, $consultaSuper);
            $dev = array();

            while ($fila = mysqli_fetch_assoc($resultadoSuper)) {
                array_push($dev, $fila);
            }

            echo json_encode($dev);
        } else if ($accion === "supermercadosFavoritos") {
            $consultaSuper = "SELECT * FROM `listasuper` WHERE `listasuper`.`favorito` = 'si' ";
            $resultadoSuper = mysqli_query($db, $consultaSuper);
            $dev = array();

            while ($fila = mysqli_fetch_assoc($resultadoSuper)) {
                array_push($dev, $fila);
            }

            echo json_encode($dev);
        } else if ($accion === "ingresar") {
            $user = filter_input(INPUT_GET, "userData");
            $pass = filter_input(INPUT_GET, "passData");
            $dev = array();
            $consultaLogin = "SELECT * FROM `listasuper` WHERE `listasuper`.`usuario` LIKE '" . $user . "' AND `contrasenia` LIKE '" . $pass . "'";
            $resultadoLogin = mysqli_query($db, $consultaLogin);
            $cantidadResultados = mysqli_num_rows($resultadoLogin);
            if ($cantidadResultados === 1) {
                http_response_code(200);
                $usuario = mysqli_fetch_assoc($resultadoLogin);
                $dev["id"] = $usuario["id"];
                $dev["mensaje"] = "Ingreso con exito";
                $dev["codigo"] = 200;
            } else {
                http_response_code(404);
                $dev["mensaje"] = "No ingreso con exito";
                $dev["sql"] = $consulta_insertar;
                $dev["codigo"] = 404;
            }

            echo json_encode($dev);
        } else {
            $consultaSuper = "SELECT * FROM `seccionessuper` WHERE `seccionessuper`.`idSupermercado` = " . $elegido;
            $resultadoSuper = mysqli_query($db, $consultaSuper);
            $dev = array();

            while ($fila = mysqli_fetch_assoc($resultadoSuper)) {
                array_push($dev, $fila);
            }

            echo json_encode($dev);
        }
      
        break;

    case "PUT":
        parse_str(file_get_contents("php://input"), $updateData);
        $accion = $updateData["accion"];

        if ($accion === "numeroSecciones") {
            $numeroNuevo = $updateData["numeroSeccion"];
            $horaActual = $updateData["horaActual"];
            $totalAcumulado = $updateData["diferencia"];

            $idUpdate = $updateData["id"];
            $consulta_cambiar = "UPDATE `seccionessuper` SET `numeroSeccion` = '" . $numeroNuevo . "' ,`ultimoMomento`= '" . $horaActual . "' ,`totalDiferencias`= '" . $totalAcumulado . "' WHERE `seccionessuper`.`id` = " . $idUpdate;
            $resultadoConsulta = mysqli_query($db, $consulta_cambiar);
            $dev = array();
            http_response_code(200);
            $dev["mensaje"] = "Hola hola";
            $dev["sql"] = $consulta_cambiar;
            $dev["codigo"] = 200;
            echo json_encode($dev);
        } else if ($accion === "resetNumeros") {

            $idUpdate = $updateData["id"];
            $nuevaFecha = $updateData["nuevaFecha"];
            $consulta_cambiar = "UPDATE `seccionessuper` SET `numeroSeccion` = '1', `numeroPedido` = '1',`turnosCancelados` = '',`ultimoMomento` = '" . $nuevaFecha . "',`totalDiferencias` = '0' WHERE `seccionessuper`.`id` = " . $idUpdate;
            $resultadoConsulta = mysqli_query($db, $consulta_cambiar);
            $dev = array();
            http_response_code(200);
            $dev["mensaje"] = "Hola hola";
            $dev["codigo"] = 200;
            echo json_encode($dev);
        } else if ($accion === "favoritear") {
            $idUpdate = $updateData["id"];
            $consulta_cambiar = "UPDATE `listasuper` SET `favorito` = 'si' WHERE `listasuper`.`id` = " . $idUpdate;
            $resultadoConsulta = mysqli_query($db, $consulta_cambiar);
            $dev = array();
            http_response_code(200);
            $dev["mensaje"] = "Hola hola";
            $dev["codigo"] = 200;
            echo json_encode($dev);
        } else if ($accion === "desFavoritear") {
            $idUpdate = $updateData["id"];
            $consulta_cambiar = "UPDATE `listasuper` SET `favorito` = 'no' WHERE `listasuper`.`id` = " . $idUpdate;
            $resultadoConsulta = mysqli_query($db, $consulta_cambiar);
            $dev = array();
            http_response_code(200);
            $dev["mensaje"] = "Hola hola";
            $dev["codigo"] = 200;
            echo json_encode($dev);
        } else if ($accion === "cancelar") {
            $idUpdate = $updateData["id"];
            $cancelados = $updateData["cancelados"];
            $consulta_cambiar = "UPDATE `seccionessuper` SET `turnosCancelados` =  '" . $cancelados . "' WHERE `seccionessuper`.`id` = " . $idUpdate;
            $resultadoConsulta = mysqli_query($db, $consulta_cambiar);
            $dev = array();
            http_response_code(200);
            $dev["mensaje"] = "Hola hola";
            $dev["sql"] = $consulta_cambiar;
            $dev["codigo"] = 200;
            echo json_encode($dev);
        } else {
            $numeroNuevo = $updateData["numeroPedido"];
            $idUpdate = $updateData["id"];

            $consulta_cambiar = "UPDATE `seccionessuper` SET `numeroPedido` = '" . $numeroNuevo . "' WHERE `seccionessuper`.`id` = " . $idUpdate;
            $resultadoConsulta = mysqli_query($db, $consulta_cambiar);
            $dev = array();
            http_response_code(200);
            $dev["mensaje"] = "Hola hola";
            $dev["codigo"] = 200;
            echo json_encode($dev);
        }
        break;
    case "POST":
        $accion = filter_input(INPUT_POST, "accion");

        if ($accion === "nuevaSeccion") {
            $nombreSeccion = filter_input(INPUT_POST, "nombreSeccion");
            $idSupermercaTres = filter_input(INPUT_POST, "idSuper");
            $nuevaFecha = filter_input(INPUT_POST, "nuevaFecha");
            $consulta_insertar = "INSERT INTO `seccionessuper` (`id`, `nombreSeccion`, `numeroSeccion`, `numeroPedido`, `idSupermercado`,`ultimoMomento`,`totalDiferencias`) VALUES (NULL, '" . $nombreSeccion . "', '1', '1', '" . $idSupermercaTres . "', '" . $nuevaFecha . "', '0');";
            $resultado_insertar = mysqli_query($db, $consulta_insertar);
            $dev = array();
            if ($resultado_insertar) {
                http_response_code(200);
                $dev["mensaje"] = "Registro insertado con éxito";
                $dev["codigo"] = 200;
            } else {
                http_response_code(404);
                $dev["mensaje"] = "Registro NO insertado con éxito";
                $dev["sql"] = $consulta_insertar;
                $dev["codigo"] = 404;
            }
            echo json_encode($dev);
        }
        break;
}

