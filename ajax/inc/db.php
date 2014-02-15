<?php
	$mysqli = new mysqli("fdb4.biz.nf", "1278321_breed", "breed1in", "1278321_breed") or die ("Wrong password or user name.");
	if ($mysqli->connect_errno) {
		echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
	}
?>