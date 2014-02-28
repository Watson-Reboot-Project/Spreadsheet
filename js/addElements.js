/*
 * This handles adding all elements to the document body
 * */
var figNum = 0;

//Div for spreadsheet grid
var tableDiv = document.createElement('div');
tableDiv.id = "table" + figNum;



var container = document.getElementById("container");
container.appendChild(tableDiv);
