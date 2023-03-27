<?php

require_once ("../../conexion.php");



$tipo = $_SERVER["REQUEST_METHOD"];


switch ($tipo) {
    
    case "POST":
        
            $cadena = filter_input(INPUT_POST, "cadenaSuper");
            $nombre = filter_input(INPUT_POST, "nombreSuper");
            $usuario = filter_input(INPUT_POST, "usuario");
            $contrasenia = filter_input(INPUT_POST, "contra");
            $nombreImagen = $_FILES['file']['name'];
            
            $ubicacion = "imgs/" . $nombreImagen;
            $devFoto = array();
            
            if (move_uploaded_file($_FILES['file']['tmp_name'], $ubicacion)) {
                $dev["ruta"] = $ubicacion;
                $dev["estado"] = "Finalizado";
            } else {
                $dev["estado"] = "Error";
            }
            echo json_encode($devFoto);
            
            $consulta_insertar = "INSERT INTO `listasuper` (`id`, `nombre`, `cadena`, `favorito`, `usuario`, `contrasenia`, `nombreImagen`) VALUES (NULL, '" . $nombre . "', '" . $cadena . "', 'no', '" . $usuario . "', '" . $contrasenia . "',  '" . $ubicacion . "');";
            $resultado_insertar = mysqli_query($db, $consulta_insertar);
            
            $dev = array();

                $dev["mensaje"] = "Registro insertado con éxito";
                $dev["codigo"] = 200;
                
            echo json_encode($dev);
            
        }

