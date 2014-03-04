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
	if(selected != undefined) {
		var sum = 0;
		var cells = ht.getData(selected[0], selected[1], selected[2], selected[3]);
		
		//Adds all selected cells
		for(var i = 0; i < cells.length; i++) {
			for(var y = 0; y < cells[i].length; y++) {
				if(cells[i][y] != null) sum += Number(cells[i][y]);
			}
		}
		ht.deselectCell();
		$("#" + tableDiv.id).on('click', function() {
			var clicked = ht.getSelected();
			if(selected[2] < clicked[0]) {
				ht.setDataAtCell(clicked[0], clicked[1], sum, true);
				$(this).off('click');
			}
		});
	}
}

//Handles the cut operation
function cut() {
	
}

