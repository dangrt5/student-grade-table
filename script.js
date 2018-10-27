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

function initializeApp(){
  addClickHandlersToElements();
  getDataFromServer();
}

/***************************************************************************************************
* addClickHandlerstoElements
* @param {undefined}
* @returns {undefined}
* single function that contains all of the event handlers
*/

function addClickHandlersToElements(){
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

function handleAddClicked(){
  $(".btn-success").click(addStudent);
}

/***************************************************************************************************
 * handleCancelClicked - Event Handler when user clicks the cancel button, should clear out student form
 * @param {undefined} none
 * @returns {undefined} none
 * @calls: clearAddStudentFormInputs
 */


function handleCancelClick(){
  $(".btn-default").click(clearAddStudentFormInputs);
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
  $("#deleteModal #studentName").val(currentStudent.name);
  $("#deleteModal #course").val(currentStudent.course);
  $("#deleteModal #studentGrade").val(currentStudent.grade);

  $("#deleteModal .btn-success").off();
  $("#deleteModal .btn-success").click(() => confirmDeleteClick(currentStudent, thisDeleteButton, thisRowIndex));
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
  $("#updateModal #studentName").attr("value", currentStudent.name);
  $("#updateModal #course").attr("value", currentStudent.course);
  $("#updateModal #studentGrade").attr("value", currentStudent.grade);

  $("#updateModal .btn-success").off();
  $("#updateModal .btn-success").click(() => confirmUpdateClick(currentStudent, thisRowIndex));

  $("#updateModal").modal("show")

}

/**************************************************************************************************
 * confirmUpdateClick - Event Handler when user clicks the confirm button, should update the selected student from the grade table
 * @param: student, row, index
 * @returns: {undefined} none
 * @calls: renderGradeAverage, calculateGradeAverage, deleteStudentDataOnServer
 */

function confirmUpdateClick(student, index) {
  studentArray[index].name = $("#updateModal #studentName").val();
  studentArray[index].course = $("#updateModal #course").val();
  studentArray[index].grade = $("#updateModal #studentGrade").val();
  renderGradeAverage(calculateGradeAverage(studentArray));
  updateStudentDataOnServer(studentArray[index]);
}

/**************************************************************************************************
 * addStudent - creates a student objects based on input fields in the form and adds the object to global student array
 * @param {undefined} none
 * @return undefined
 * @calls clearAddStudentFormInputs, updateStudentList, postStudentDataToServer
 */


function addStudent(){
  if($("#studentName").val() === "" || $("#course").val() === "" || $("#studentGrade").val() === "") {
    return;
  }
  var newStudentInfo = {};
  newStudentInfo.name = $("#studentName").val();
  newStudentInfo.course = $("#course").val();
  newStudentInfo.grade = $("#studentGrade").val();
  studentArray.push(newStudentInfo);
  clearAddStudentFormInputs();
  updateStudentList(newStudentInfo);
  postStudentDataToServer(newStudentInfo);
}

/**************************************************************************************************
 * clearAddStudentFormInputs - clears the form inputs
 * @param {undefined} none
 */

function clearAddStudentFormInputs(){
  $("#studentName").val("");
  $("#course").val("");
  $("#studentGrade").val("");
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
      for(var i = 0; i < studentData.length; i++) {
        studentArray.push(studentData[i]);
        updateStudentList(studentData[i]);
      }
    },
    error: function(error) {
      var errorMessage = "Error Status: " + error.status + ". " + error.statusText;
      $(".modal-body h1").text(errorMessage);
      $("#errorModal").modal("show");
    }
  }
  $.ajax(studentInfoConfig);
}

function postStudentDataToServer(student) {
  var serverConfiguration = {
    url: "api/data.php",
    method: "GET",
    data: {
      action: "insert",
      name : student.name,
      course : student.course,
      grade : student.grade,
    },
    dataType: "json",
    success: function(result) {
      studentArray[studentArray.length-1].id = result.id;
      getDataFromServer();
    },
    error: function(error) {
      var errorMessage = "Error Status: " + error.status + ". " + error.statusText;
      $(".modal-body h1").text(errorMessage);
      $("#errorModal").modal("show");
    }
  }
  $.ajax(serverConfiguration);
};

function deleteStudentDataOnServer(selectedStudent) {
  var serverConfiguration = {
    url: "api/data.php",
    method: "GET",
    dataType: "json",
    data: {
      action: "delete",
      id: selectedStudent.id
    },
    success: function(result) {
      getDataFromServer();
    },
    error: function(error) {
      var errorMessage = "Error Status: " + error.status + ". " + error.statusText;
      $(".modal-body h1").text(errorMessage);
      $("#errorModal").modal("show");
    }
  }
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
    success: function(result) {
      getDataFromServer();
    },
    error: function(error) {
      var errorMessage = "Error Status: " + error.status + ". " + error.statusText;
      $(".modal-body h1").text(errorMessage);
      $("#errorModal").modal("show");
    }
  }
  $.ajax(serverConfiguration);
}

function renderStudentOnDom(studentObj){
  $("<tr>").appendTo("tbody");

  var lastRowCreated = $("tbody tr:last-child");

  var newStudentName = $("<td>", {
    text: studentObj.name
  });

  var newStudentCourse = $("<td>", {
    text: studentObj.course
  });

  var newStudentGrade = $("<td>", {
    text: studentObj.grade
  });

  var tableButton1 = $("<td>");

  var deleteButton = $("<button>", {
    class: "btn btn-danger",
    text: "Delete"
  });

  var tableButton2 = $("<td>");

  var updateButton = $("<button>", {
    class: "btn btn-warning",
    text: "Update"
  });

  var studentOptions = $("<td>");

  tableButton1.append(updateButton);
  tableButton2.append(deleteButton);
  lastRowCreated.append(newStudentName, newStudentCourse, newStudentGrade, tableButton1, tableButton2);
}

function updateStudentList(students){
  renderStudentOnDom(students);
  renderGradeAverage(calculateGradeAverage(studentArray));
}

function calculateGradeAverage(arrayStudents){
  if(arrayStudents.length === 0) {
    return 0;
  }
  var averageTotalGrade = 0;
  for(var i = 0; i < arrayStudents.length; i++) {
    averageTotalGrade += parseFloat(arrayStudents[i].grade);
  }
 averageTotalGrade = (averageTotalGrade / arrayStudents.length).toFixed(0);
 return averageTotalGrade;
}

function renderGradeAverage(averageNumber){
  $(".label-default").text(averageNumber);
}
