<?php

//check if you have all the data you need from the client-side call.
//if not, add an appropriate error to errors

$name = $_GET["name"];
$course_name = $_GET["course"];
$grade = $_GET["grade"];


//write a query that inserts the data into the database.  remember that ID doesn't need to be set as it is auto incrementing
$query = "INSERT INTO `student_data` (`name`, `course`, `grade`)
VALUES ('$name', '$course_name', '$grade')";
//send the query to the database, store the result of the query into $result
$result = mysqli_query($conn, $query);

//check if $result is empty.
if(empty($result)) {
  $output["errors"][] = "database error";
} else {
    if(mysqli_affected_rows($conn) === 1) {
      $output["success"] = true;
      $output["id"] = mysqli_insert_id($conn);
    } else {
      $output["errors"][] = "insert error";
      }
  }
	//if it is, add 'database error' to errors
//else:
	//check if the number of affected rows is 1
		//if it did, change output success to true
		//get the insert ID of the row that was added
		//add 'insertID' to $outut and set the value to the row's insert ID
	//if not, add to the errors: 'insert error'

?>
