<?php
//$root = realpath($_SERVER["DOCUMENT_ROOT"]);
require_once(dirname(__FILE__) . "/inc/db.php");
$usertable = 'bomberman_users';

$username = $_REQUEST['username'];
$email = $_REQUEST['email'];
$password = md5($_REQUEST['password']);

// check if user already exists
$query = "SELECT username, email FROM $usertable WHERE email = ? OR username = ?";
$stmt = $mysqli->prepare($query);
$stmt->bind_param('ss', $username, $email); // i= integer, s= string ... combine as "is..."
$stmt->execute();
$stmt->store_result();

$success = false;
$msg = 'Error';

if( $stmt->num_rows > 0 ){
	$msg = "{$username} already exists in database";
	$stmt->close();
} else {
	$stmt->close();
	$query = "INSERT INTO $usertable (username, email, password) VALUES (?, ?, ?)";
	$stmt = $mysqli->prepare($query);
	$stmt->bind_param('sss', $username, $email, $password); // i= integer, s= string ... combine as "is..."
	$stmt->execute();
	$success = true;
	$msg = "Inserted {$username} into database";
	$stmt->close();
}
$mysqli->close();

$result = new StdClass();
$result->success = $success;
$result->msg = $msg;

$json = json_encode($result);
echo $json;

/*
$query = "SELECT username FROM bomberman_users";
//$query = "SELECT username FROM bomberman_users where id = ?";
//$id = 1;

$stmt = $mysqli->prepare($query);
//$stmt->bind_param('i', $id); // i= integer, s= string ... combine as "is..."
$stmt->execute();
$stmt->bind_result($username);
//$stmt->fetch(); // for only one result
while ($stmt->fetch()) {
	echo $username;
	// or
	printf("%s", $username);
}
*/

?>