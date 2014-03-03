/*
 * This handles the functions for the cells
 * */
var ht = $("#"+tableDiv.id).handsontable('getInstance');

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
	var sum = 0;
	var cells = ht.getData(selected[0], selected[1], selected[2], selected[3]);
	
	//Adds all selected cells
	for(var i = 0; i < cells.length; i++) {
		for(var y = 0; y < cells[i].length; y++) {
			if(cells[i][y] != null) sum += Number(cells[i][y]);
		}
	}
	return sum;
}

//Handles the cut operation
function cut() {
	
}

