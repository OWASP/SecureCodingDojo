<?php
$output="";
$input="";
if(isset($_GET["name"]))
{
    $input = $_GET["name"];
    $output = shell_exec("ping -c 1 $input");
    $input = htmlentities($input);
}
?>
<form>
<h1>Network Diagnostics</h1>    
Host name:
<input name="name" value="<?php echo $input;?>"><input type="submit" value="submit"></form>

<?php
echo "<pre>$output</pre>";
?>