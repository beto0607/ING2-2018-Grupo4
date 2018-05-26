<h1 class="page-header">Login</h1>

<div class="row">
    <div class="col-sm-4"></div>
    <div class="col-sm-4">
        <form method="post" action="?c=Auth&a=Autenticar" role="login">
            <input type="text" name="usuario" placeholder="Usuario" required class="form-control input-lg" value="" autocomplete="off" />
            <input type="password" name="password" class="form-control input-lg" id="password" placeholder="Password" required autocomplete="off" />
            <hr />
            <button type="submit" name="go" class="btn btn-lg btn-primary btn-block">Ingresar</button>
        </form>
    </div>
</div>