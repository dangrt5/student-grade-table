$(document).ready(initializeApp);

var studentArray = [];

function initializeApp(){
  addClickHandlersToElements();
  getDataFromServer();
}

function addClickHandlersToElements(){
  handleAddClicked();
  handleCancelClick();
  $("tbody").on("click", "td button", handleDeleteClick);
  handleGatherDataClick();
}

function handleAddClicked(){
  $(".btn-success").click(addStudent);
}

function handleCancelClick(){
  $(".btn-default").click(clearAddStudentFormInputs);
}

function handleDeleteClick() {
  var thisDeleteButton = $(this);
  var thisRowIndex = $(this).closest("tr").index();
  var currentStudent = studentArray[thisRowIndex];
  studentArray.splice(thisRowIndex, 1)
  $(this).closest("tr").remove();
  renderGradeAverage(calculateGradeAverage(studentArray));
  deleteStudentDataOnServer(currentStudent)
}

function handleGatherDataClick() {
  $(".btn-info").click(getDataFromServer);
}

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

function clearAddStudentFormInputs(){
  $("#studentName").val("");
  $("#course").val("");
  $("#studentGrade").val("");
}

function getDataFromServer() {
  var studentInfoConfig = {
    url: "http://s-apis.learningfuze.com/sgt/get",
    method: "POST",
    dataType: "json",
    "data": {
      "api_key": "nvSIsRsYCc"
    },
    success: function(result) {
      var studentData = result.data;
      for(var i = 0; i < studentData.length; i++) {
        studentArray.push(studentData[i]);
        updateStudentList(studentData[i]);
      }
    },
    error: function(errorResult) {
      var result = errorResult;
      var errorMessage = "Error Status: " + errorResult.status + ". " + errorResult.statusText;
      $(".modal-body h1").text(errorMessage);
      $("#errorModal").modal("show");
    }
  }
  $.ajax(studentInfoConfig);
}

function postStudentDataToServer(student) {
  var serverConfiguration = {
    url: "http://s-apis.learningfuze.com/sgt/create",
    method: "GET",
    dataType: "json",
    "data": {
      "api_key": "nvSIsRsYCc",
      "name": student.name,
      "course": student.course,
      "grade": student.grade,
    },
    success: function(result) {
      var successResult = result;
      if(!result.success) {
        var errorMessage = successResult.errors.join(". ");
        $(".modal-body h1").text("Error: " + errorMessage);
        $("#errorModal").modal("show");
        console.log(result.errors);
      } else {
          console.log(result.success);
          var studentIDNumber = successResult.new_id;
          studentArray[studentArray.length-1].id = studentIDNumber;
        }
    },
    error: function(errorResult) {
      var result = errorResult;
      var errorMessage = "Error Status: " + errorResult.status + ". " + errorResult.statusText;
      $(".modal-body h1").text(errorMessage);
      $("#errorModal").modal("show");
    }
  }
  $.ajax(serverConfiguration);
};

function deleteStudentDataOnServer(selectedStudent) {
  var serverConfiguration = {
    url: "http://s-apis.learningfuze.com/sgt/delete",
    method: "POST",
    dataType: "json",
    "data": {
      "api_key": "nvSIsRsYCc",
      "student_id": selectedStudent.id
    },
    success: function(successResult) {
      var result = successResult;
      if(!result.success) {
        $(".modal-body h1").text("Error: " + result.errors);
        console.log(result.errors);
        $("#errorModal").modal("show");
        return;
      } console.log(result.success)
    },
    error: function(errorResult) {
      var result = errorResult;
      var errorMessage = "Error Status: " + errorResult.status + ". " + errorResult.statusText;
      $(".modal-body h1").text(errorMessage);
      $("#errorModal").modal("show");
    }
  }
  $.ajax(serverConfiguration);
}

function renderStudentOnDom(studentObj){
  $("<tr>").appendTo("tbody");

  var lastRowCreated = $("tbody tr:last-child");
  var newStudentName = $("<td>" + studentObj.name + "</td>");
  var newStudentCourse = $("<td>" + studentObj.course + "</td>");
  var newStudentGrade = $("<td>" + studentObj.grade + "</td>");
  var deleteButton = $("<td><button class='btn btn-danger'>" + "Delete" + "</button></td>");

  lastRowCreated.append(newStudentName, newStudentCourse, newStudentGrade, deleteButton);
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
