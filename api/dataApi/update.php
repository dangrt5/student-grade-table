<?php

if(empty($_GET["name"]) || empty($_GET["course"]) || empty($_GET["grade"]) || empty($_GET["id"])) {
  $output["errors"] = "Edit Failed";
}

$name = $_GET["name"];
$course = $_GET["course"];
$grade = $_GET["grade"];
$id = $_GET["id"];

//check if you have all the data you need from the client-side call.  This should include the fields being changed and the ID of the student to be changed
//if not, add an appropriate error to errors

//write a query that updates the data at the given student ID.
$query = " UPDATE `student_data` SET `name` = '$name', `course` = '$course', `grade` = '$grade' WHERE `id` = '$id' ";
$result = mysqli_query($conn, $query);
//send the query to the database, store the result of the query into $result

if(empty($result)) {
  $output["errors"][] = "Database Error";
} else {
    if(mysqli_affected_rows($conn) > 0) {
      $output["success"] = true;
    } else {
        $output["errors"][] = "Update Error";
    }
}


//check if $result is empty.
	//if it is, add 'database error' to errors
//else:
	//check if the number of affected rows is 1.  Please note that if the data updated is EXCACTLY the same as the original data, it will show a result of 0
		//if it did, change output success to true
	//if not, add to the errors: 'update error'

?>
