/*
 * This handles the functionality of the table
 * */

//global variables
var currSelect;
var cellData = new Array(); //Not sure if this idea will work...

$('#' + tableDiv.id).handsontable({
  minSpareRows: 30,
  minSpareCols: 20,
  maxRows: 30,
  maxCols: 20,
  height: 500,
  rowHeaders: true,
  colHeaders: true,
  outsideClickDeselects: false
});

//On page load..
$(document).ready(function() {
	//Holds copy of every cell. This is for use with the input bar or when users are editing a function in a cell.
	for(var i = 0; i < 30; i++) {
		cellData[cellData.length] = new Array(20);
	}
	
	//set offset for buttons
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
	
	//Listens for click
	$(document).on('click', function(evt) {
		var selected = topLeft(ht.getSelected());
		currSelect = selected;
		if(selected != undefined) {
			var data = ht.getDataAtCell(selected[0], selected[1]);
			if(data != null) changeInput(data);
		}
		cellRefresh();
	});
	
	//Listens for any keypresses. Won't detect enter keypress.
	$(document).on('keydown', function(evt) {
		console.log("keydown");
		var selected = topLeft(ht.getSelected());
		if(selected != currSelect && selected != undefined) {
			var data = ht.getDataAtCell(selected[0], selected[1]);
			changeInput(data);
		}
		cellRefresh();
	});
	
	//Detect Enter key and trigger keypress
	$("#" + tableDiv.id).keydown(function(evt) { if(evt.which == 13) $(document).trigger('keydown'); });
	
});








