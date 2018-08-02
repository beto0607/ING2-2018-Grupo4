/* CLEAR DB */
TRUNCATE TABLE mensajes;
TRUNCATE TABLE respuestas;
TRUNCATE TABLE vehiculos;
TRUNCATE TABLE calificaciones;
TRUNCATE TABLE copilotos;
DELETE FROM viajes;
ALTER TABLE viajes AUTO_INCREMENT = 1;
DELETE FROM usuarios;
ALTER TABLE usuarios AUTO_INCREMENT = 1;

INSERT INTO `usuarios` (`id`, `usuario`, `clave`, `nombre`, `apellido`, `fechaNacimiento`, `telefono`, `email`, `calificacionPiloto`, `calificacionCopiloto`, `fechaBaja`, `cbu`, `foto`) VALUES
(1, 'admin', '7c4a8d09ca3762af61e59520943dc26494f8941b', 'Don', 'Administrador', '1981-04-01', '544545', 'don.admin@gmail.com', 0, 0, NULL, '', NULL),
(2, 'user2', '1234', 'User', 'Dos', '1997-05-01', '22244655841', 'j@h.com', 2, 2, NULL, '', NULL),
(10, 'pepe2000', '7c4a8d09ca3762af61e59520943dc26494f8941b', 'José', 'Gomez', '2000-01-01', '221 4802825', 'pepe2000@hotmail.com', 0, 0, NULL, '', NULL),
(11, 'jorgito', '7c4a8d09ca3762af61e59520943dc26494f8941b', 'Jorge', 'Perez', '1978-05-09', '221 4721416', 'jorgito_de_la_gente@uol-sinectis.com', 0, 0, NULL, '', NULL),
(12, 'claudita02', '7c4a8d09ca3762af61e59520943dc26494f8941b', 'Claudia', 'Mendez', '1990-08-24', '221 4528896', 'claudia02@aol.com', 0, 0, NULL, '', NULL),
(13, 'javi', '7110eda4d09e062aa5e4a390b0a572ac0d2c0220', 'Javier', 'Saupurein', '1993-01-06', '2244', 'javi@hotmail.com', 0, 0, NULL, '1234123451234512345155', 'NULO'),
(14, 'viajero', '7c4a8d09ca3762af61e59520943dc26494f8941b', 'Rodolfo', 'Viaje', '1990-05-12', '255', 'javi@h.com', 0, 0, NULL, NULL, 'NULO'),
(15, 'marcos', '7c4a8d09ca3762af61e59520943dc26494f8941b', 'Marcos', 'Mar', '1990-02-25', '2233', 'm@h.com', 0, 0, NULL, NULL, 'NULO'),
(16, 'carlos', '7c4a8d09ca3762af61e59520943dc26494f8941b', 'Carlos', 'Perez', '1989-08-14', '4455', 'c@h.com', 0, 0, NULL, NULL, 'NULO'),
(17, 'ruben', '7c4a8d09ca3762af61e59520943dc26494f8941b', 'Ruben', 'Lopez', '1988-04-16', '33234', 'r@h.com', 0, 0, NULL, NULL, 'NULO'),
(18, 'martin', '7c4a8d09ca3762af61e59520943dc26494f8941b', 'Martin', 'Martinez', '1987-10-17', '345678', 'martin@hotmail.com', 0, 0, NULL, NULL, 'NULO'),
(19, 'jose', '7c4a8d09ca3762af61e59520943dc26494f8941b', 'Jose', 'Rodriguez', '1991-01-01', '09876', 'jose@hotmail.com', 0, 0, NULL, NULL, 'NULO'),
(20, 'charly', '7c4a8d09ca3762af61e59520943dc26494f8941b', 'Charly', 'Garcia', '1985-02-16', '238674', 'charly@hotmail.com', 0, 0, NULL, NULL, 'NULO');

INSERT INTO `vehiculos` (`id`, `idUsuario`, `dominio`, `descripcion`, `modelo`, `marca`, `plazas`, `fechaBaja`) VALUES
(1, 1, 'AAA123', 'Auto nuevo', '2008', 'Chevrolet', 5, NULL),
(2, 2, 'ABC111', 'Camioneta', '1994', 'Ford', 3, '2018-05-25 21:36:34'),
(10, 10, 'ABC111', 'Auto piola, cómodo y bien cuidado. No te deja a pata nunca', '147', 'FIAT', 4, NULL),
(11, 10, 'GJC089', 'Un clásico. A veces hay que empujarlo para que arranque.', '600', 'FIAT', 4, NULL),
(12, 11, 'JQJ234', 'Es casi un remis. Hay lugar en el baúl', 'Aveo', 'CHEVROLET', 5, NULL),
(13, 12, 'UTY341', 'Lo cuido mucho, va como trompada', 'Fiesta', 'FORD', 5, NULL),
(14, 12, 'NHF763', 'Re cómodo', '308', 'PEUGEOT', 5, NULL),
(15, 13, 'GGG444', 'Una bosta', '2005', 'Ford', 3, NULL),
(16, 13, 'FFF888', 'Esta todo sucio', 'gol', 'volkswagen', 3, NULL),
(17, 18, 'WWT111', 'A 50km/h!!!', '3CV', 'Citroen', 3, NULL),
(18, 19, 'AA111BB', 'La nave', 'Corolla', 'Toyota', 5, NULL),
(19, 20, 'kkk555', 'Fiesta!!!', 'Fiesta', 'Ford', 4, NULL),
(20, 20, 'RRR666', 'Rojo', 'Focus', 'Ford', 3, NULL);

INSERT INTO `viajes` (`id`, `idVehiculo`, `fecha`, `origen`, `destino`, `plazas`, `descripcion`, `montoTotal`, `porcentajeComision`, `fechaCancelacion`, `fechaCierre`, `duracion`, `fechaCreacion`, `cbu`) VALUES
(1, 1, '2018-05-29 00:00:00', 'La Plata', 'Buenos Aires', 3, 'Voy por autopista', '600.00', '5.00', NULL, NULL, '02:00:00', '2018-06-25 21:08:34', '1111'),
(10, 10, '2018-05-05 00:00:00', 'La Plata', 'Chascomus', 3, 'Salgo a la mañana temprano y para el mediodía calculo que llegamos. Vamos por la ruta 2', '1800.00', '10.00', NULL, NULL, '02:00:00', '2018-06-25 21:08:34', '1111'),
(11, 11, '2018-05-15 00:00:00', 'La Plata', 'Buenos Aires', 3, 'Voy todos los días, es para probar el sistema', '800.00', '10.00', NULL, NULL, '02:00:00', '2018-06-25 21:08:34', '1111'),
(12, 11, '2018-05-06 00:00:00', 'La Plata', 'Magdalena', 3, 'Vamos tranqui tomando mate. Cuando llegamos asadito y vemos.', '500.00', '10.00', NULL, NULL, '02:00:00', '2018-06-25 21:08:34', '1111'),
(13, 16, '2018-07-19 16:00:00', 'La Plata', 'Las Flores', 3, 'A 200!!', '400.00', '5.00', NULL, NULL, '00:00:00', '2018-07-12 00:28:22', '1234123451234512345155'),
(14, 16, '2018-07-16 18:00:00', 'La Plata', 'Ensenada', 3, 'Todos los dias hasta alla', '100.00', '5.00', NULL, NULL, '01:00:00', '2018-07-12 00:29:50', '1234123451234512345155'),
(15, 16, '2018-07-17 18:00:00', 'La Plata', 'Ensenada', 3, 'Todos los dias hasta alla', '100.00', '5.00', NULL, NULL, '01:00:00', '2018-07-12 00:29:50', '1234123451234512345155'),
(16, 16, '2018-07-18 18:00:00', 'La Plata', 'Ensenada', 3, 'Todos los dias hasta alla', '100.00', '5.00', '2018-07-12 00:44:45', NULL, '01:00:00', '2018-07-12 00:29:50', '1234123451234512345155'),
(17, 16, '2018-07-19 18:00:00', 'La Plata', 'Ensenada', 3, 'Todos los dias hasta alla', '100.00', '5.00', NULL, NULL, '01:00:00', '2018-07-12 00:29:50', '1234123451234512345155'),
(18, 16, '2018-07-20 18:00:00', 'La Plata', 'Ensenada', 3, 'Todos los dias hasta alla', '100.00', '5.00', NULL, NULL, '01:00:00', '2018-07-12 00:29:50', '1234123451234512345155'),
(19, 16, '2018-07-21 18:00:00', 'La Plata', 'Ensenada', 3, 'Todos los dias hasta alla', '100.00', '5.00', NULL, NULL, '01:00:00', '2018-07-12 00:29:50', '1234123451234512345155'),
(20, 16, '2018-07-22 18:00:00', 'La Plata', 'Ensenada', 3, 'Todos los dias hasta alla', '100.00', '5.00', NULL, NULL, '01:00:00', '2018-07-12 00:29:50', '1234123451234512345155'),
(21, 16, '2018-07-23 18:00:00', 'La Plata', 'Ensenada', 3, 'Todos los dias hasta alla', '100.00', '5.00', NULL, NULL, '01:00:00', '2018-07-12 00:29:50', '1234123451234512345155'),
(22, 17, '2018-08-07 23:00:00', 'Azul', 'Monte', 2, 'Prefiero viajar de noche que no hay policia', '800.00', '5.00', NULL, NULL, '03:00:00', '2018-07-19 18:55:25', '12341234123412341234'),
(23, 17, '2018-11-15 22:00:00', 'Azul', 'La Plata', 3, 'asasa', '900.00', '5.00', NULL, NULL, '10:00:00', '2018-07-19 18:59:36', '12341234123412341234'),
(24, 17, '2018-08-01 21:00:00', 'Azul', 'Olavarria', 1, 'drewr', '300.00', '5.00', NULL, NULL, '05:00:00', '2018-07-19 19:02:21', '12341234123412341234'),
(25, 18, '2018-10-01 16:30:00', 'Tandil', 'Rauch', 5, 'Voy 3 dias por trabajo', '789.00', '5.00', NULL, NULL, '00:00:00', '2018-07-19 19:10:02', '1111111111111111111111'),
(26, 18, '2018-10-02 16:30:00', 'Tandil', 'Rauch', 5, 'Voy 3 dias por trabajo', '789.00', '5.00', NULL, NULL, '00:00:00', '2018-07-19 19:10:02', '1111111111111111111111'),
(27, 18, '2018-10-03 16:30:00', 'Tandil', 'Rauch', 5, 'Voy 3 dias por trabajo', '789.00', '5.00', NULL, NULL, '00:00:00', '2018-07-19 19:10:02', '1111111111111111111111'),
(28, 19, '2018-09-15 20:00:00', 'Cordoba', 'Santa Fe', 4, 'choco seguido', '1000.00', '5.00', NULL, NULL, '06:00:00', '2018-07-19 19:37:57', '45674567456745674567'),
(29, 20, '2018-09-21 15:30:00', 'Cordoba', 'Salta', 3, 'Paro a cada rato', '850.00', '5.00', NULL, NULL, '09:00:00', '2018-07-19 19:41:21', '46574567456745674567');

INSERT INTO `copilotos` (`idViaje`, `idUsuario`, `fechaPostulacion`, `fechaAprobacion`, `fechaPago`, `montoPago`, `fechaCancelacion`, `fechaRechazo`) VALUES
(13, 14, '2018-07-12 00:36:54', NULL, NULL, NULL, '2018-07-12 00:38:57', NULL),
(16, 14, '2018-07-12 00:37:31', '2018-07-12 00:44:07', NULL, NULL, '2018-07-12 00:44:45', NULL),
(17, 14, '2018-07-12 00:38:25', NULL, NULL, NULL, NULL, '2018-07-12 00:43:30'),
(24, 15, '2018-07-24 18:02:09', '2018-07-24 18:20:17', NULL, NULL, NULL, NULL),
(25, 15, '2018-07-24 18:02:51', NULL, NULL, NULL, NULL, NULL),
(22, 16, '2018-07-24 18:09:47', NULL, NULL, NULL, NULL, NULL),
(23, 16, '2018-07-24 18:11:24', '2018-07-24 18:21:52', NULL, NULL, NULL, NULL),
(24, 16, '2018-07-24 18:10:44', NULL, NULL, NULL, NULL, '2018-07-24 18:20:51'),
(25, 17, '2018-07-24 18:13:33', '2018-07-24 18:25:51', NULL, NULL, NULL, NULL),
(25, 20, '2018-07-24 18:15:22', '2018-07-24 18:25:26', NULL, NULL, NULL, NULL);

