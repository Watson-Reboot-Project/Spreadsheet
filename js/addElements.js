/*
 * This handles adding all elements to the document body
 * */
var figNum = 0;

//div for first row
var row_1 = document.createElement('div');
row_1.id = "row1" + figNum;
row_1.className = "row";

//Div to restrict with of spreadsheet
var tableHolder = document.createElement('div');
tableHolder.className = "col-md-6";

//Spreadsheet div
var tableDiv = document.createElement('div');
tableDiv.id = "table" + figNum;

//input for cell functions
var input = document.createElement('input');
input.id = "input" + figNum;
input.style.width = "600px";
input.type = "text";
input.name = "Functions";

//Div for buttons
var buttonDiv = document.createElement('div');
buttonDiv.id = 'buttonDiv' + figNum;
buttonDiv.className = "btn-group-vertical";

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
container.appendChild(input);
container.appendChild(row_1);

$(document).ready(function() {
	var offset = $("#" + buttonDiv.id).offset();
	$("#" + buttonDiv.id).offset({top: offset.top+55, left : offset.left});
	
	//button listeners
	$("#" + undoButton.id).click(function() { undo(); });
	$("#" + redoButton.id).click(function() { redo(); });
	$("#" + sumButton.id).click(function() { sum(); });
	$("#" + cutButton.id).click(function() { cut(); });
	$("#" + copyButton.id).click(function() { copy(); });
	$("#" + pasteButton.id).click(function() { paste(); });
	$("#" + clearButton.id).click(function() { clear(); });
	$("#" + averageButton.id).click(function() { average(); });
	
	//Cut event listener
	$(document).bind('cut', function() {
		cut();
	});
	
	$(document).on('click', function(evt) {
		var selected = topLeft(ht.getSelected());
		if(selected != undefined) {
			var data = ht.getDataAtCell(selected[0], selected[1]);
			if(data != null) changeInput(data);
		}
	});
});








