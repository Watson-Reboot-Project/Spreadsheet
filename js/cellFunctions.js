/*
 * This handles the functions for the cells
 * */
var ht = $("#"+tableDiv.id).handsontable('getInstance');

var tempCopy;
var offset;

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
				var string = "=SUM(" + funcStrCreator(selected) + ")"
				funcTracker[clicked[0]*ht.countRows()+clicked[1]] = new cellFunction(clicked[0], clicked[1], string);
				ht.setDataAtCell(clicked[0], clicked[1], string, true);
				$(this).off('click');
			}
		});
	}
}

//Handles the average operation
function average() {
	var selected = ht.getSelected();
	if (selected != undefined) {
	var cells = ht.getData(selected[0], selected[1], selected[2], selected[3]);
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
				var string = "=AVG(" + funcStrCreator(selected) + ")"
				funcTracker[clicked[0]*ht.countRows()+clicked[1]] = new cellFunction(clicked[0], clicked[1], string);
				ht.setDataAtCell(clicked[0], clicked[1], string, true);
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
		var allZero = emptyArray(selected[0], selected[1], selected[2], selected[3]);
		ht.populateFromArray(selected[0],selected[1], allZero, selected[2], selected[3]);
		/**
		for(var i = selected[0]; i <= selected[2]; i++) {
			for(var y = selected[1]; y <= selected[3]; y++) {
				ht.setDataAtCell(i, y, null, true);
			}
		}
		*/
		
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
		ht.populateFromArray(selected[0], selected[1], tempCopy, selected[0]+tempCopy.length-1, selected[1]+tempCopy[0].length-1);
		/**
		for(var i = selected[0]; i < tempCopy.length + selected[0]; i++) {
			for(var y = selected[1]; y < tempCopy[0].length + selected[1]; y++) {
				if(i < 30) ht.setDataAtCell(i, y, tempCopy[i-selected[0]][y-selected[1]], true);
			}
		}
		*/
	}
}

//Handles the clear operation
function clear() {
	var selected = topLeft(ht.getSelected());
	var data = ht.getData(selected[0], selected[1], selected[2], selected[3]);
	if(selected != undefined)
	{
    var allZero = emptyArray(selected[0], selected[1], selected[2], selected[3])
    ht.populateFromArray(selected[0],selected[1], allZero, selected[2], selected[3]);
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

//Changes text in intput bar
function changeInput(text) {
  if(!(ib.is(":focus")))
  {
    $("#" + input.id).val(text);
  }
}

//Keeps track of all function cells (Cells with =SUM() or =AVG())
function cellFunction(row, col, funcString) {
	this.row = row;
	this.col = col;
	this.funcString = funcString;
}

//takes coordinates for a selection and a specified cell, and marks all
//cells within the range specified in details as used by cell
function updateDependencyArrays(row, col, endRow, endCol, cellRow, cellCol)
{
  var error = false;
  for (var i=row; i<=endRow; i++)
  {
    if(usedBy[i]===undefined)
      usedBy[i] = [];
    if(dependantOn[cellRow]===undefined)
      dependantOn[cellRow] = [];
    for(var k=col; k<=endCol; k++)
    {
      if(usedBy[i][k]===undefined)
        usedBy[i][k] = [];
      if(dependantOn[cellRow][cellCol]===undefined)
        dependantOn[cellRow][cellCol] = [];
      if(usedBy[i][k][cellRow]===undefined)
        usedBy[i][k][cellRow] = [];
      if(dependantOn[cellRow][cellCol][i]===undefined)
        dependantOn[cellRow][cellCol][i] = [];
      usedBy[i][k][cellRow][cellCol] = true;
      dependantOn[cellRow][cellCol][i][k] = true;
      //check for circular dependency. dependantOn[cellRow][cellCol][i][k]
      //is known to be true. If dependantOn[i][k][cellCol][cellRow] is also true,
      //then a circular dependancy has been found.
      if(dependantOn[i]!==undefined && dependantOn[i][k]!==undefined && 
      dependantOn[i][k][cellCol]!==undefined &&
      dependantOn[i][k][cellCol][cellRow]!==undefined && dependantOn[i][k][cellCol][cellRow])
      {
        error = true;
      }
    }
  }
}

//Convenience function that allows for a much smaller signature of updateDependencyArrays()
function updateDependencyByDetails(details, cell)
{
  updateDependencyArrays(details.row, details.col, details.endRow, details.endCol, cell.row, cell.col);
}

//sets the value of all dependant cells
function notifyDependants(row, col)
{
  console.log(row);
  console.log(col);
  console.log(usedBy);
  //Cycle through cells and search for dependant cells.
  if(usedBy[row]!== undefined && usedBy[row][col]!==undefined)
  {
    for(var i=0; i<usedBy[row][col].length; i++)
    {
      if(usedBy[row][col][i]!==undefined)
      {
        for(var k=0; k<usedBy[row][col][i].length; k++)
        {
          //when a dependant cell is found, update it.
          if(usedBy[row][col][i][k])
          {
            console.log(funcTracker[i*ht.countRows()+k]);
            ht.setDataAtCell(i, k, funcTracker[i*ht.countRows()+k].funcString);
          }
        }
      }
    }
  }
}

//Called whenever the function string of a cell is reevaluated.
//Removes references to cells that the specified cell is dependant on.
//Does not clear references by cells that are dependant on the specified cell.
function clearAssociations(row, col)
{
  //check to see if cell is dependant on anything
  if(dependantOn[row]!== undefined && dependantOn[row][col]!==undefined)
  {
    //cycle through and remove dependancies
    for(var i= 0; i<dependantOn[row][col].length; i++)
    {
      for(var k=0; k<dependantOn[row][col][i].length; k++)
      {
        dependantOn[row][col][i][k] = false;
        usedBy[i][k][row][col] = false;
      }
    }
  }
}

function functionSUM(details)
{
  var sum = 0;
  var temp = 0;
  for(var i = details.row;i<=details.endRow;i++)
  {
    for(var k =details.col;k<=details.endCol;k++)
    {
      temp=parseInt(ht.getDataAtCell(i, k));
      if(isNaN(temp))
        temp=0;
      sum+=temp;
    }
  }
  return sum;
}

function functionAVG(details)
{
  var sum =0;
  var temp =0;
  var count =0;
  for(var i = details.row;i<=details.endRow;i++)
  {
    for(var k =details.col;k<=details.endCol;k++)
    {
      temp=parseInt(ht.getDataAtCell(i, k));
      if(isNaN(temp))
        temp=0;
      sum+=temp;
      count++;
    }
  }
  return sum/count;
}


function funcStrCreator(selection) {
	selection = topLeft(selection);
	var start = String.fromCharCode(selection[1]+65) + Number(selection[0]+1);
	var end = String.fromCharCode(selection[3]+65) + Number(selection[2]+1);
	var final = start + ":" + end;
	return final;
}

/**
	Creates an empty array for the given start and end metrics
	of a table.
*/
function emptyArray(row, col, endRow, endCol)
{
	if((row>endRow)||(col>endCol))
		return -1;
	//Normalize all to start at 0.
	endRow=endRow-row;
	row=row-row;
	endCol=endCol-col;
	col=col-col;
	var allNull = new Array();
	for(var i=row; i<=endRow;i++)
	{
		allNull[i] = new Array();
		for(var k=col; k<=endCol;k++)
		{
			allNull[i][k] = null;
		}
	}
	return allNull;
}





