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
/***********************
 * student_array - global array to hold student objects
 * @type {Array}
 * example of student_array after input:
 * student_array = [
 *  { name: 'Jake', course: 'Math', grade: 85 },
 *  { name: 'Jill', course: 'Comp Sci', grade: 85 }
 * ];
 */

var studentArray = [];


/***************************************************************************************************
* initializeApp
* @params {undefined} none
* @returns: {undefined} none
* initializes the application, including adding click handlers and pulling in any data from the server, in later versions
*/
function initializeApp(){
  addClickHandlersToElements();
}

/***************************************************************************************************
* addClickHandlerstoElements
* @params {undefined}
* @returns  {undefined}
*
*/
function addClickHandlersToElements(){
  handleAddClicked();
  handleCancelClick();
  $("tbody").on("click", "td button", handleDeleteClick);
  handleGatherDataClick();

}

/***************************************************************************************************
 * handleAddClicked - Event Handler when user clicks the add button
 * @param {object} event  The event object from the click
 * @return:
       none
 */
function handleAddClicked(){
  $(".btn-success").click(addStudent);
}
/***************************************************************************************************
 * handleCancelClicked - Event Handler when user clicks the cancel button, should clear out student form
 * @param: {undefined} none
 * @returns: {undefined} none
 * @calls: clearAddStudentFormInputs
 */
function handleCancelClick(){
  $(".btn-default").click(clearAddStudentFormInputs);
}

function handleDeleteClick() {
  var currentDeleteButtonIndex = $(this).closest("tr").index();
  studentArray.splice(currentDeleteButtonIndex, 1)
  $(this).closest("tr").remove();
  renderGradeAverage(calculateGradeAverage(studentArray));
}

function handleGatherDataClick() {
  $(".btn-info").click(getDataFromServer);
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
      console.log(studentData);
      for(var i = 0; i < studentData.length; i++) {
        studentArray.push(studentData[i]);
        updateStudentList(studentData[i]);
      }
    }
  }
  $.ajax(studentInfoConfig);
}
/***************************************************************************************************
 * addStudent - creates a student objects based on input fields in the form and adds the object to global student array
 * @param {undefined} none
 * @return undefined
 * @calls clearAddStudentFormInputs, updateStudentList
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
}
/***************************************************************************************************
 * clearAddStudentForm - clears out the form values based on inputIds variable
 */
function clearAddStudentFormInputs(){
  $("#studentName").val("");
  $("#course").val("");
  $("#studentGrade").val("");
}
/***************************************************************************************************
 * renderStudentOnDom - take in a student object, create html elements from the values and then append the elements
 * into the .student_list tbody
 * @param {object} studentObj a single student object with course, name, and grade inside
 */
function renderStudentOnDom(studentObj){
  $("<tr>").appendTo("tbody");

  var lastRowCreated = $("tbody tr:last-child");
  var newStudentName = $("<td>" + studentObj.name + "</td>");
  var newStudentCourse = $("<td>" + studentObj.course + "</td>");
  var newStudentGrade = $("<td>" + studentObj.grade + "</td>");
  var deleteButton = $("<td><button class='btn btn-danger'>" + "Delete" + "</button></td>");

  lastRowCreated.append(newStudentName, newStudentCourse, newStudentGrade, deleteButton);

  // newStudentName.appendTo(lastRowCreated);
  // newStudentCourse.appendTo(lastRowCreated);
  // newStudentGrade.appendTo(lastRowCreated);
  // deleteButton.appendTo(lastRowCreated);
}

/***************************************************************************************************
 * updateStudentList - centralized function to update the average and call student list update
 * @param students {array} the array of student objects
 * @returns {undefined} none
 * @calls renderStudentOnDom, calculateGradeAverage, renderGradeAverage
 */
function updateStudentList(students){
  renderStudentOnDom(students);
  renderGradeAverage(calculateGradeAverage(studentArray));
}
/***************************************************************************************************
 * calculateGradeAverage - loop through the global student array and calculate average grade and return that value
 * @param: {array} students  the array of student objects
 * @returns {number}
 */
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
/***************************************************************************************************
 * renderGradeAverage - updates the on-page grade average
 * @param: {number} average    the grade average
 * @returns {undefined} none
 */
function renderGradeAverage(averageNumber){
  $(".label-default").text(averageNumber);
}
