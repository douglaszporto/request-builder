<?php

if(!empty($_POST)) {

	echo "POST AS FORM ENCODE:<br>\n";
	print_r($_POST);

} else {

	$data = json_decode(file_get_contents("php://input"));
	echo "POST AS RESQUEST PAYLOAD";
	print_r($data);
}

echo "\n\nHEADERS\n\n";
print_r($_SERVER);

?>