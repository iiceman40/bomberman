<?php
//$root = realpath($_SERVER["DOCUMENT_ROOT"]);
require_once(dirname(__FILE__) . "/inc/db.php");
$usertable = 'bomberman_users';

$username = $_REQUEST['username'];
$email = $_REQUEST['email'];
//$password = md5($_REQUEST['password']);

// check if user already exists
$query = "UPDATE $usertable SET username = ? WHERE email = ?";
$stmt = $mysqli->prepare($query);
$stmt->bind_param('ss', $username, $email); // i= integer, s= string ... combine as "is..."
$stmt->execute();

$success = false;
$msg = 'Error';

if($mysqli->affected_rows > 0){
	$success = true;
	$msg = "Set {$username} as username";
} else $msg = "User {$email} not found or username didn't change.";

$stmt->close();
$mysqli->close();

$result = new StdClass();
$result->success = $success;
$result->msg = $msg;

$json = json_encode($result);
echo $json;

?>