/*
 * This handles the functions for the cells
 * */
var ht = $("#"+tableDiv.id).handsontable('getInstance');
var tempCopy;

//Redoes the last undone operation
function undo() {
	ht.undo();
}

//Undoes the last operation
function redo() {
	ht.redo();
}

//Handles the sum operation
function sum() {
	var selected = ht.getSelected();
	if(selected != undefined) {
		var sum = 0;
		var cells = ht.getData(selected[0], selected[1], selected[2], selected[3]);
		
		//Adds all selected cells
		for(var i = 0; i < cells.length; i++) {
			for(var y = 0; y < cells[i].length; y++) {
				if(cells[i][y] != null) sum += Number(cells[i][y]);
			}
		}
		
		//Deselect selection
		ht.deselectCell();
		
		//Inserts sum in cell if it's below the original selection
		$("#" + tableDiv.id).on('click', function() {
			var clicked = ht.getSelected();
			if(selected[2] < clicked[0]) {
				ht.setDataAtCell(clicked[0], clicked[1], sum, true);
				$(this).off('click');
			}
		});
	}
}

//Handles the average operation
function average() {
	var selected = ht.getSelected();
	var cells = ht.getData(selected[0], selected[1], selected[2], selected[3]);
	if (selected != undefined) {
		var sum = 0;
		var count = 0;
		//Adds all selected cells
		for(var i = 0; i < cells.length; i++) {
			for(var y = 0; y < cells[i].length; y++) {
				if(cells[i][y] != null) {
					sum += Number(cells[i][y]);
					if (cells[i][y].length > 0) count++;
				}
			}
		}
		
		//Deselect selection
		ht.deselectCell();
		
		//Inserts average in cell if it's below the original selection
		$("#" + tableDiv.id).on('click', function() {
			var clicked = ht.getSelected();
			if(selected[2] < clicked[0]) {
				ht.setDataAtCell(clicked[0], clicked[1], sum/count, true);
				$(this).off('click');
			}
		});
	}
}

//Handles the cut operation
function cut() {
	if (ht.getSelected() != undefined) {
		var selected = topLeft(ht.getSelected());
		tempCopy = ht.getData(selected[0], selected[1], selected[2], selected[3]);
		for(var i = selected[0]; i <= selected[2]; i++) {
			for(var y = selected[1]; y <= selected[3]; y++) {
				ht.setDataAtCell(i, y, null, true);
			}
		}
	}
}

//Handles the copy operation
function copy() {
	if (ht.getSelected() != undefined) {
		var selected = topLeft(ht.getSelected());
		tempCopy = ht.getData(selected[0], selected[1], selected[2], selected[3]);
	}
}

//Handles the paste operation
function paste() {
	var selected = ht.getSelected();
	if(tempCopy != undefined && selected != undefined) {
		for(var i = selected[0]; i < tempCopy.length + selected[0]; i++) {
			for(var y = selected[1]; y < tempCopy[0].length + selected[1]; y++) {
				ht.setDataAtCell(i, y, tempCopy[i-selected[0]][y-selected[1]], true);
			}
		}
	}
}

//Handles the clear operation
function clear() {
	var selected = topLeft(ht.getSelected());
	var data = ht.getData(selected[0], selected[1], selected[2], selected[3]);
	if(selected != undefined) {
		for(var i = selected[0]; i <= selected[2]; i++) {
			if(!ht.isEmptyRow(i)) {
				for(var y = selected[1]; y <= selected[3]; y++) {
					if(ht.getDataAtCell(i, y) != null) ht.setDataAtCell(i, y, null, true);
				}
			}
		}
	}
}

//Returns a selection in format [top, left, bottom, right]
function topLeft(selected) {
	if(selected != undefined) {
		var newSelect = [0,0,0,0];
		if(selected[0] < selected[2]) {
			newSelect[0] = selected[0];
			newSelect[2] = selected[2];
		}
		else {
			newSelect[0] = selected[2];
			newSelect[2] = selected[0];
		}
		if(selected[1] < selected[3]) {
			newSelect[1] = selected[1];
			newSelect[3] = selected[3];
		}
		else {
			newSelect[1] = selected[3];
			newSelect[3] = selected[1];
		}
		return newSelect;
	}
}

function changeInput(text) {
	$("#" + input.id).val(text);
}








