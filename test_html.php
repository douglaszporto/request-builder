<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Html Test</title>
</head>
<body>
	<?php 
		$loop = empty($_POST["repeater"]) ? 0 : $_POST["repeater"];
		for($i=0; $i<$loop; $i++): 
	?><div><?php echo $i ?></div><?php if($i % 10 == 0) echo "<br>\n"; endfor; ?>
</body>
</html>