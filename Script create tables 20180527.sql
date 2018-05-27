CREATE TABLE `calificaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idViaje` int(11) NOT NULL,
  `idUsuarioCalifica` int(11) NOT NULL,
  `IdUsuarioCalificado` int(11) NOT NULL,
  `fechaCalificacion` datetime NOT NULL,
  `calificacion` int(11) NOT NULL,
  `observaciones` varchar(256) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_cali_viaje_idx` (`idViaje`),
  KEY `fk_cali_usu_1_idx` (`idUsuarioCalifica`),
  KEY `fk_cali_usu_2_idx` (`IdUsuarioCalificado`),
  CONSTRAINT `fk_cali_usu_1` FOREIGN KEY (`idUsuarioCalifica`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_cali_usu_2` FOREIGN KEY (`IdUsuarioCalificado`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_cali_viaje` FOREIGN KEY (`idViaje`) REFERENCES `viajes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `copilotos` (
  `idViaje` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `fechaPostulacion` datetime NOT NULL,
  `fechaAprobacion` datetime DEFAULT NULL,
  `fechaPago` datetime DEFAULT NULL,
  `montoPago` decimal(10,2) DEFAULT NULL,
  `fechaCancelacion` datetime DEFAULT NULL,
  `fechaRechazo` datetime DEFAULT NULL,
  PRIMARY KEY (`idUsuario`,`idViaje`,`fechaPostulacion`),
  KEY `fk_copiloto_viaje_idx` (`idViaje`),
  CONSTRAINT `fk_copiloto_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_copiloto_viaje` FOREIGN KEY (`idViaje`) REFERENCES `viajes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
