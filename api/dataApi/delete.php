<?php

//check if you have all the data you need from the client-side call.
if(empty($_GET["id"])) {
	$output["error"][] = "Delete Failed";
}

$id = $_GET['id'];

//if not, add an appropriate error to errors

//write a query that deletes the student by the given student ID
$query = " DELETE FROM `student_data` WHERE `id` = '$id' ";
//send the query to the database, store the result of the query into $result
$result = mysqli_query($conn, $query);

if(empty($result)) {
	$output["errors"][] = "Database Error";
} else {
		if(mysqli_affected_rows($conn) === 1) {
			$output["success"] = true;
		} else {
			$output["errors"] = "Delete Error";
		}
	}


//check if $result is empty.
	//if it is, add 'database error' to errors
//else:
	//check if the number of affected rows is 1
		//if it did, change output success to true

	//if not, add to the errors: 'delete error'

?>
