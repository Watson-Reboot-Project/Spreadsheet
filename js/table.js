/*
 * This handles the functionality of the table
 * */

//global variables
var currSelect;
var funcTracker = new Array();

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
	$("#" + formatButton.id).click(function() { format(); });
	
	//Cut event listener
	$(document).bind('cut', function() {
		cut();
	});
	
	//Listen for any changes to cells.
	$("#" + tableDiv.id).handsontable({
		afterChange: function(changes, source) {
			var selected = ht.getSelected();
			var isFunction = false
			for(var i = 0; i < funcTracker.length; i++) {
				if(funcTracker[i].row == selected[0] && funcTracker[i].col == selected[1]) {
					changeInput(funcTracker[i].funcString);
					isFunction = true;
					break;
				}
			}
			if(!isFunction) changeInput(ht.getDataAtCell(selected[0], selected[1]));
		}
	});
	
	//Listens for enter key. When detected, prevent the default action (edit cell) and simply move to next row.
	$("#" + tableDiv.id).handsontable({
		beforeKeyDown: function(evt) {
			if(evt.which == 13) {
				if(!evt.shiftKey) {
					evt.stopImmediatePropagation();
					var selected = topLeft(ht.getSelected());
					ht.selectCell(selected[0]+1, selected[1]);
				}
				else {
					evt.stopImmediatePropagation();
					var selected = topLeft(ht.getSelected());
					ht.selectCell(selected[0]-1, selected[1]);
				}
			}
		}
	});
	
	//Listens for selection changing
	$("#" + tableDiv.id).handsontable({
		afterSelection: function(r, c, r2, c2) {
			var selected = ht.getSelected();
			var isFunction = false
			for(var i = 0; i < funcTracker.length; i++) {
				if(funcTracker[i].row == selected[0] && funcTracker[i].col == selected[1]) {
					changeInput(funcTracker[i].funcString);
					isFunction = true;
					break;
				}
			}
			if(!isFunction) changeInput(ht.getDataAtCell(selected[0], selected[1]));
		}
	});
	
	//Listens for double click
	$(document).on('dblclick', function(evt) {
		console.log("DOUBLE CLICK. need to change cell to 'edit' value");
		var selected = topLeft(ht.getSelected());
		currSelect = selected;
		if(selected != undefined) {
			var data = ht.getDataAtCell(selected[0], selected[1]);
			if(data != null) changeInput(data);
		}
	});
	
});








