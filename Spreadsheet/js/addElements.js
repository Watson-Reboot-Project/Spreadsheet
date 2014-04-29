/*
 * This handles adding all elements to the document body
 * */
 
/*
  Story time: jquery mobile has its own CSS which is completely anathema to
  the watson reboot. The CSS file is also required or jquery mobile or else
  it puts a perpetual loading message at the bottom of the screen. The solution?
  Don't let jquery mobile initialize the page.
*/
jQuery(document).on("mobileinit", function() {
    jQuery.mobile.autoInitializePage = false;
});
 
var figNum = 0;

//div for first row
var row_1 = document.createElement('div');
row_1.id = "row1" + figNum;
row_1.className = "row";

//Div to restrict with of spreadsheet
var tableHolder = document.createElement('div');
tableHolder.className = "col-md-8 col-xs-9 tableHolder";
tableHolder.style = "overflow: hidden";
//Spreadsheet div
var tableDiv = document.createElement('div');
tableDiv.id = "WatsonTable" + figNum;

//input for cell functions
var functionBox = document.createElement('input');
functionBox.id = "functionBox" + figNum;
functionBox.type = "text";
functionBox.name = "Functions";
functionBox.className = "input-group col-md-8 col-xs-9";

// moves bootstrap to next row
var cfDiv = document.createElement('div');
cfDiv.className = "clearfix";

//Div for buttons
var buttonDiv = document.createElement('div');
buttonDiv.id = 'buttonDiv' + figNum;
buttonDiv.className = "btn-group-vertical col-xs-2 col-md-1 col-md-offset-1 col-xs-offset-1";

//Buttons
var cutButton = document.createElement('button');
cutButton.id = "cut" + figNum;
cutButton.className = "btn btn-default btn-md btn-primary"
cutButton.style.width = "90px";
cutButton.innerHTML = "Cut";

var copyButton = document.createElement('button');
copyButton.id = "copy" + figNum;
copyButton.className = "btn btn-default btn-md btn-primary"
copyButton.style.width = "90px";
copyButton.innerHTML = "Copy";

var pasteButton = document.createElement('button');
pasteButton.id = "paste" + figNum;
pasteButton.className = "btn btn-default btn-md btn-primary"
pasteButton.style.width = "90px";
pasteButton.innerHTML = "Paste";

var clearButton = document.createElement('button');
clearButton.id = "clear" + figNum;
clearButton.className = "btn btn-default btn-md btn-primary"
clearButton.style.width = "90px";
clearButton.innerHTML = "Clear";

var sep1 = document.createElement('div');
sep1.style.height = "30px";
sep1.style.width = "90px";

var undoButton = document.createElement('button');
undoButton.id = "undo" + figNum;
undoButton.className = "btn btn-default btn-md btn-warning"
undoButton.style.width = "90px";
undoButton.innerHTML = "Undo";

var redoButton = document.createElement('button');
redoButton.id = "redo" + figNum;
redoButton.className = "btn btn-default btn-md btn-warning"
redoButton.style.width = "90px";
redoButton.innerHTML = "Redo";

var sep2 = document.createElement('div');
sep2.style.height = "30px";
sep2.style.width = "90px";

var sumButton = document.createElement('button');
sumButton.id = "sum" + figNum;
sumButton.className = "btn btn-default btn-md btn-success"
sumButton.style.width = "90px";
sumButton.innerHTML = "Sum";

var averageButton = document.createElement('button');
averageButton.id = "average" + figNum;
averageButton.className = "btn btn-default btn-md btn-success"
averageButton.style.width = "90px";
averageButton.innerHTML = "Average";

var sep3 = document.createElement('div');
sep3.style.height = "30px";
sep3.style.width = "90px";

var formatButton = document.createElement('button');
formatButton.id = "format" + figNum;
formatButton.className = "btn btn-default btn-md btn-danger"
formatButton.style.width = "90px";
formatButton.innerHTML = "Format";


//Append everything that needs appending
//Button appends
buttonDiv.appendChild(cutButton);
buttonDiv.appendChild(copyButton);
buttonDiv.appendChild(pasteButton);
buttonDiv.appendChild(clearButton);
//buttonDiv.appendChild(sep1);
buttonDiv.appendChild(undoButton);
buttonDiv.appendChild(redoButton);
//buttonDiv.appendChild(sep2);
buttonDiv.appendChild(sumButton);
buttonDiv.appendChild(averageButton);
//buttonDiv.appendChild(sep3);			//Ask Mike if he likes these better in
buttonDiv.appendChild(formatButton);
tableHolder.appendChild(tableDiv);

row_1.appendChild(tableHolder);
row_1.appendChild(buttonDiv);

var container = document.getElementById("container");
container.appendChild(functionBox);
container.appendChild(row_1);





