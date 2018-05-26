<h1 class="page-header">
    Usuarios
</h1>

<div class="well well-sm text-right">
    <a class="btn btn-primary" href="?c=Usuario&a=Crud&token=<?php echo @$_GET['token']; ?>">Nuevo usuario</a>
</div>

<table class="table table-striped">
    <thead>
        <tr>
            <th style="width:180px;">Nombre</th>
            <th>Apellido</th>
            <th>Correo</th>
            <th style="width:120px;">Usuario</th>
            <th style="width:120px;">Fecha Nacimiento</th>
            <th style="width:60px;"></th>
            <th style="width:60px;"></th>
        </tr>
    </thead>
    <tbody>
    <?php foreach($this->model->Listar() as $r): ?>
        <tr>
            <td><?php echo $r->nombre; ?></td>
            <td><?php echo $r->apellido; ?></td>
            <td><?php echo $r->email; ?></td>
            <td><?php echo $r->usuario; ?></td>
            <td><?php echo $r->fechaNacimiento; ?></td>
            <td>
                <a href="?c=Usuario&a=Crud&id=<?php echo $r->id; ?>&token=<?php echo @$_GET['token']; ?>">Editar</a>
            </td>
            <td>
                <a onclick="javascript:return confirm('¿Seguro de eliminar este registro?');" href="?c=Usuario&a=Eliminar&id=<?php echo $r->id; ?>&token=<?php echo @$_GET['token']; ?>">Eliminar</a>
            </td>
        </tr>
    <?php endforeach; ?>
    </tbody>
</table> 
