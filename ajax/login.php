<?php
//$root = realpath($_SERVER["DOCUMENT_ROOT"]);
require_once(dirname(__FILE__) . "/inc/db.php");
$usertable = 'bomberman_users';

//$username = $_REQUEST['username'];
$email = $_REQUEST['email'];
$password = md5($_REQUEST['password']);

// check if user already exists
$query = "SELECT username, email, password FROM $usertable WHERE email = ?";
$stmt = $mysqli->prepare($query);
$stmt->bind_param('s', $email); // i= integer, s= string ... combine as "is..."
$stmt->execute();
$stmt->bind_result($username_db, $email_db, $password_db);
$stmt->store_result();

$success = false;
$msg = 'Error';

if( $stmt->num_rows > 0 ){
	$stmt->fetch();
	if( $password == $password_db){
		$success = true;
		$msg = "Logged in as {$username} into database";
	} else $msg = "Wrong Password!";
	$stmt->close();
} else {
	$msg = "No user with email {$email} found in database";
}
$mysqli->close();

$result = new StdClass();
$result->success = $success;
$result->msg = $msg;
$result->username = $username_db;
$result->email = $email_db;

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