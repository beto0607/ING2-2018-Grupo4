CREATE TABLE mensajes (
  id int(11) NOT NULL AUTO_INCREMENT,
  fecha datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  mensaje varchar(2048) NOT NULL,
  idViaje int(11) NOT NULL,
  idUsuario int(11) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
