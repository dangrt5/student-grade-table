/* information about jsdocs:
* param: http://usejsdoc.org/tags-param.html#examples
* returns: http://usejsdoc.org/tags-returns.html
*
/**
 * Listen for the document to load and initialize the application
 */

$(document).ready(initializeApp);

/**
 * Define all global variables here.
 */

var studentArray = [];

/***************************************************************************************************
* initializeApp
* @param {undefined} none
* @returns {none}
* initializes the application, including adding click handlers and pulling in any data from the server, in later versions
*/

function initializeApp() {
  addClickHandlersToElements();
  getDataFromServer();
  $(document).ajaxStart(function() {
    $(".fa-spin").show();
  });
  $(document).ajaxComplete(function() {
    $(".fa-spin").hide();
  });
}

/***************************************************************************************************
* addClickHandlerstoElements
* @param {undefined}
* @returns {undefined}
* single function that contains all of the event handlers
*/

function addClickHandlersToElements() {
  handleAddClicked();
  handleCancelClick();
  $("tbody").on("click", "td .btn-danger", handleDeleteClick);
  $("tbody").on("click", "td .btn-warning", handleUpdateClick);
}

/***************************************************************************************************
 * handleAddClicked - Event Handler when user clicks the add button
 * @param {object} event  The event object from the click
 * @return {none}
 */

function handleAddClicked() {
  $(".add-button").click(addStudent);
}

/***************************************************************************************************
 * handleCancelClicked - Event Handler when user clicks the cancel button, should clear out student form
 * @param {undefined} none
 * @returns {undefined} none
 * @calls: clearAddStudentFormInputs
 */

function handleCancelClick() {
  $(".clear-button").click(clearAddStudentFormInputs);
}

/***************************************************************************************************
 * handleDeleteClicked - Event Handler when user clicks the delete button, should open the confirmation modal
 * @param {undefined} none
 * @returns {undefined}
 * @calls {none}
 */

function handleDeleteClick() {
  var thisDeleteButton = $(this);
  var thisRowIndex = $(this).closest("tr").index();
  var currentStudent = studentArray[thisRowIndex];

  $("#deleteModal .modal-title").text(`Confirm Delete: ${currentStudent.name}`);
  $("#deleteModal .student-name").val(currentStudent.name);
  $("#deleteModal .course").val(currentStudent.course);
  $("#deleteModal .grade").val(currentStudent.grade);

  $(".delete-button").off();
  $(".delete-button").click(() => confirmDeleteClick(currentStudent, thisDeleteButton, thisRowIndex));
  $("#deleteModal").modal("show");

}

/**************************************************************************************************
 * confirmDeleteClick - Event Handler when user clicks the confirm button, should remove the selected student from the grade table
 * @param: student, row, index
 * @returns: {undefined} none
 * @calls: renderGradeAverage, calculateGradeAverage, deleteStudentDataOnServer
 */

function confirmDeleteClick(student, row, index) {
  studentArray.splice(index, 1);
  row.closest("tr").remove();
  renderGradeAverage(calculateGradeAverage(studentArray));
  deleteStudentDataOnServer(student);
}

/**************************************************************************************************
 * handleUpdateClicked - Event Handler when user clicks the update button, should edit student information
 * @param: {undefined} none
 * @returns: {undefined} none
 * @calls:
 */

function handleUpdateClick() {
  var thisUpdateButton = $(this);
  var thisRowIndex = thisUpdateButton.closest("tr").index();
  var currentStudent = studentArray[thisRowIndex];

  $("#updateModal .modal-title").text(`Edit Student: ${currentStudent.name}?`);
  $("#updateModal .student-name").val(currentStudent.name);
  $("#updateModal .student-course").val(currentStudent.course);
  $("#updateModal .student-grade").val(currentStudent.grade);

  $(".update-button").off();
  $(".update-button").click(() => confirmUpdateClick(thisRowIndex));
  $("updateModal .invalid-input").hide();
  $("#updateModal").modal("show");

}

/**************************************************************************************************
 * confirmUpdateClick - Event Handler when user clicks the confirm button, should update the selected student from the grade table
 * @param: student, row, index
 * @returns: {undefined} none
 * @calls: renderGradeAverage, calculateGradeAverage, deleteStudentDataOnServer
 */

function confirmUpdateClick(index) {
  var updatedStudent = {}; //START HERE
  updatedStudent.name = $("#updateModal .student-name").val().trim();
  updatedStudent.course = $("#updateModal .student-course").val().trim();
  updatedStudent.grade = $("#updateModal .student-grade").val().trim();
  validateUpdateStudent(updatedStudent, index);
}

/**************************************************************************************************
 * addStudent - creates a student objects based on input fields in the form and adds the object to global student array
 * @param {undefined} none
 * @return undefined
 * @calls clearAddStudentFormInputs, updateStudentList, postStudentDataToServer
 */

function addStudent() {
  var newStudentInfo = {};
  newStudentInfo.name = $(".student-name").val().trim();
  newStudentInfo.course = $(".course").val().trim();
  newStudentInfo.grade = $(".grade").val().trim();
  validateAddStudent(newStudentInfo);
}

/**************************************************************************************************
 * clearAddStudentFormInputs - clears the form inputs
 * @param {undefined} none
 */

function clearAddStudentFormInputs() {
  $(".student-name").val("");
  $(".course").val("");
  $(".grade").val("");

  $(".invalid-name").css("display", "none");
  $(".invalid-course").css("display", "none");
  $(".invalid-grade").css("display", "none");
}

function getDataFromServer() {
  var studentInfoConfig = {
    url: "api/data.php",
    method: "GET",
    data: {
      action: "readAll"
    },
    dataType: "json",
    success: function(result) {
      studentArray = [];
      $("tbody").empty();
      var studentData = result.data;
      for (var i = 0; i < studentData.length; i++) {
        studentArray.push(studentData[i]);
        updateStudentList(studentData[i]);
      }
    },
    error: function(error) {
      var errorMessage = "Error Status: " + error.status + ". " + error.statusText;
      $(".modal-body h1").text(errorMessage);
      $("#errorModal").modal("show");
    }
  };
  $.ajax(studentInfoConfig);
}

function postStudentDataToServer(student) {
  var serverConfiguration = {
    url: "api/data.php",
    method: "GET",
    data: {
      action: "insert",
      name: student.name,
      course: student.course,
      grade: student.grade
    },
    dataType: "json",
    success: function(result) {
      studentArray[studentArray.length - 1].id = result.id;
      getDataFromServer();
    },
    error: function(error) {
      var errorMessage = "Error Status: " + error.status + ". " + error.statusText;
      $("#errorModal .modal-body h1").text(errorMessage);
      $("#errorModal").modal("show");
    }
  };
  $.ajax(serverConfiguration);
}

function deleteStudentDataOnServer(selectedStudent) {
  var serverConfiguration = {
    url: "api/data.php",
    method: "GET",
    dataType: "json",
    data: {
      action: "delete",
      id: selectedStudent.id
    },
    success: function() {
      getDataFromServer();
    },
    error: function(error) {
      var errorMessage = "Error Status: " + error.status + ". " + error.statusText;
      $("#errorModal .modal-body h1").text(errorMessage);
      $("#errorModal").modal("show");
    }
  };
  $.ajax(serverConfiguration);
}

function updateStudentDataOnServer(student) {
  var serverConfiguration = {
    url: "api/data.php",
    method: "GET",
    dataType: "json",
    data: {
      action: "update",
      name: student.name,
      course: student.course,
      grade: student.grade,
      id: student.id
    },
    success: function() {
      getDataFromServer();
    },
    error: function(error) {
      var errorMessage = "Error Status: " + error.status + ". " + error.statusText;
      $("#errorModal .modal-body h1").text(errorMessage);
      $("#errorModal").modal("show");
    }
  };
  $.ajax(serverConfiguration);
}

function renderStudentOnDom(studentObj) {
  $("<tr>").appendTo("tbody");
  var lastRowCreated = $("tbody tr:last-child");
  var newStudentName = $("<td>", {text: studentObj.name});
  var newStudentCourse = $("<td>", {text: studentObj.course});
  var newStudentGrade = $("<td>", {
    text: studentObj.grade < 10 ? "0" + studentObj.grade : studentObj.grade
  });
  
  var tableButton1 = $("<td>").attr("colspan", "2");
  var deleteButton = $("<button>", {
    class: "btn btn-danger"
  });

  var deleteIcon = $("<span>", {
    class: "glyphicon glyphicon-trash visible-xs"
  });

  var deleteText = $("<span>", {
    text: "Delete",
    class: "visible-sm visible-md visible-lg"
  });

  // var tableButton2 = $("<td>");
  var updateButton = $("<button>", {
    class: "btn btn-warning",
  });

  var updateIcon = $("<span>", {
    class: "glyphicon glyphicon-pencil visible-xs"
  });

  var updateText = $("<span>", {
    text: "Update",
    class: "visible-sm visible-md visible-lg"
  });

  deleteButton.append(deleteIcon, deleteText);
  updateButton.append(updateIcon, updateText);
  tableButton1.append(updateButton, deleteButton);
  lastRowCreated.append(newStudentName, newStudentCourse, newStudentGrade, tableButton1);
}

function updateStudentList(students) {
  renderStudentOnDom(students);
  renderGradeAverage(calculateGradeAverage(studentArray));
}

function calculateGradeAverage(arrayStudents) {
  if (arrayStudents.length === 0) {
    return 0;
  }
  var averageTotalGrade = 0;
  for (var i = 0; i < arrayStudents.length; i++) {
    averageTotalGrade += parseFloat(arrayStudents[i].grade);
  }
  averageTotalGrade = (averageTotalGrade / arrayStudents.length).toFixed(0);
  return averageTotalGrade;
}

function renderGradeAverage(averageNumber) {
  $(".label-default").text(averageNumber);
}

function validateAddStudent(student) {
  var validName = /^[a-zA-Z]+ ?[a-zA-Z]*$/;
  var validCourse = /^[a-zA-Z]+ ?[a-zA-Z]*$/;
  var validGrade = /^[0-9]{1,3}$/;

  var validationCheck = {
    name: true,
    course: true,
    grade: true
  };

  if(student.name.length > 20) {
    $(".new-student .invalid-name")
      .text("The maximum characters for this field is 20.")
      .css("display", "block");
    validationCheck.name = false;
  } else if(validName.test(student.name)) {
      $(".new-student .invalid-name").css("display", "none");
    } else {
        $(".new-student .invalid-name")
          .text("Enter a valid first and/or last name.")
          .css("display", "block");
        validationCheck.name = false;
    }

  if(student.course.length > 20) {
    $(".new-student .invalid-course")
      .text("The maximum characters for this field is 20.")
      .css("display", "block");
    validationCheck.course = false;
  }
  else if(validCourse.test(student.course)) {
    $(".new-student .invalid-course").css("display", "none");
  } else {
      $(".new-student .invalid-course")
        .text("Enter a valid student course only containing letters and/or a space.")
        .css("display", "block");
      validationCheck.course = false;
  }

  if(validGrade.test(student.grade) && parseInt(student.grade) <= 100) {
    $(".new-student .invalid-grade").css("display", "none");
  } else {
      $(".new-student .invalid-grade").css("display", "block");
      validationCheck.grade = false;
  }

  if(validationCheck.name && validationCheck.course && validationCheck.grade) {
    studentArray.push(student);
    clearAddStudentFormInputs();
    updateStudentList(student);
    postStudentDataToServer(student);
  }
}

function validateUpdateStudent(student, index) {
  var validationCheck = {
    name: true,
    course: true,
    grade: true
  };
  var validName = /^[a-zA-Z]+ ?[a-zA-Z]*$/;
  var validCourse = /^[a-zA-Z]+ ?[a-zA-Z]*$/;
  var validGrade = /^[0-9]{1,3}$/;

  if(student.name.length > 20) {
    $("#updateModal .invalid-name")
      .text("The maximum characters for this field is 20.")
      .css("display", "block");
    validationCheck.name = false;
  } else if(validName.test(student.name)) {
      $("#updateModal .invalid-name").css("display", "none");
    } else {
        $("#updateModal .invalid-name")
          .text("Enter a valid first and/or last name.")
          .css("display", "block");
        validationCheck.name = false;
      }

  if(student.course.length > 20) {
    $("#updateModal .invalid-course")
      .text("The maximum characters for this field is 20.")
      .css("display", "block");
    validationCheck.course = false;
  } else if(validCourse.test(student.course)) {
      $("#updateModal .invalid-course").css("display", "none");
    } else {
        $("#updateModal .invalid-course")
        .text("Enter a valid student course only containing letters and/or a space.")
        .css("display", "block");
        validationCheck.course = false;
    }

  if(validGrade.test(student.grade) && parseInt(student.grade) <= 100) {
    $("#updateModal .invalid-grade").css("display", "none");
  } else {
      $("#updateModal .invalid-grade").css("display", "block");
      validationCheck.grade = false;
  }

  if(validationCheck.name && validationCheck.course && validationCheck.grade) {
    studentArray[index].name = student.name;
    studentArray[index].course = student.course;
    studentArray[index].grade = student.grade;
    renderGradeAverage(calculateGradeAverage(studentArray));
    updateStudentDataOnServer(studentArray[index]);
    $("#updateModal").modal("hide");
  }

}