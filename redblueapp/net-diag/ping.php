<form>
<h1>Network Diagnostics</h1>    
Host name:
<input name="name"><input type="submit" value="submit"></form>

<?php
if(isset($_GET["name"]))
{
    $output = shell_exec("ping -c 1 ".$_GET["name"]);
    echo "<pre>$output</pre>";
}
?>