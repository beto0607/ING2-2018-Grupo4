UPDATE Usuarios 
	SET usuario = '<anónimo>', 
		clave = '<anónimo>', 
        nombre = '<anónimo>', 
        apellido = '<anónimo>', 
        email = '<anónimo>', 
        telefono = '<anónimo>', 
        cbu = '<anónimo>' 
	WHERE fechaBaja IS NOT NULL;