//TODO: updating cells after format change

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
				ht.setDataAtCell(clicked[0], clicked[1], string);
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
				var string = "=AVG(" + funcStrCreator(selected) + ")";
				ht.setDataAtCell(clicked[0], clicked[1], string);
				$(this).off('click');
			}
		});
	}
}

function format()
{
  var selected = ht.getSelected();
	if (selected != undefined)
	{
      if(selected[0]<selected[2])
      {
          var row = selected[0];
          var endRow = selected[2];
      }    
      else
      {
          var endRow = selected[0];
          var row = selected[2];
      }
      if(selected[1]<selected[3])
      {
          var col = selected[1];
          var endCol = selected[3];
      }    
      else
      {
          var endCol = selected[1];
          var col = selected[3];
      }
	}
	var options = ["No Format", "1", "1.0", "1.00", "1.000", "$1.00"];
	var choice;
	new Selector().open("Format Number", options, function(selection)
	{
    if(selection.indexOf("$1.00")>=0)
      choice = formatOption.DOLLARS;
    else if(selection.indexOf("1.000")>=0)
      choice = formatOption.THREE;
    else if(selection.indexOf("1.00")>=0)
      choice = formatOption.TWO;
    else if(selection.indexOf("1.0")>=0)
      choice = formatOption.ONE;
    else if(selection.indexOf("1")>=0)
      choice = formatOption.ZERO;
    else if(selection.indexOf("No Format")>=0)
      choice = formatOption.FNONE;
    for(var i = row; i <= endRow; i++)
    {
      if(formatArray[i]===undefined)
        formatArray[i] = [];
			for(var k = col; k <= endCol; k++)
			{
        formatArray[i][k] = choice;
        if(funcTracker[i*ht.countRows()+k]!==undefined)
            ht.setDataAtCell(i, k, funcTracker[i*ht.countRows()+k]);
	    }
		}
	});
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
  return error;
}

//Convenience function that allows for a much smaller signature of updateDependencyArrays()
function updateDependencyByDetails(details, cell)
{
  updateDependencyArrays(details.row, details.col, details.endRow, details.endCol, cell.row, cell.col);
}

//sets the value of all dependant cells
function notifyDependants(row, col)
{
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
      if(dependantOn[row][col][i]!==undefined)
      {
        for(var k=0; k<dependantOn[row][col][i].length; k++)
        {
          if(dependantOn[row][col][i][k]==true)
          {
            dependantOn[row][col][i][k] = false;
            usedBy[i][k][row][col] = false;
          }
        }
      }
    }
  }
}

function functionSUM(details)
{
  var sum = 0;
  var temp = 0;
  if (details.row>details.endRow)
  {
    var temp = details.row;
    details.row = details.endRow;
    details.endRow=temp;
  }
  if (details.col>details.endCol)
  {
    var temp = details.col;
    details.col = details.endCol;
    details.endCol=temp;
  }
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
  if (details.row>details.endRow)
  {
    var temp = details.row;
    details.row = details.endRow;
    details.endRow=temp;
  }
  if (details.col>details.endCol)
  {
    var temp = details.col;
    details.col = details.endCol;
    details.endCol=temp;
  }
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

function evaluateTableExpression(expression, selectedCell)
{
      //replace all cell names with the values of those cells.
      //And replace SUM and AVG operations with their values.
      
      var selected = [];
      selected[0] = selectedCell.row;
      selected[1] = selectedCell.col;
      var SUMAVG = expression.match(SUMAVGRE);
      //cycle through occurences of SUM or AVG functions
      while(SUMAVG!==null)
      {
        var expressionStart;
        var expressionEnd;
        var insert;
        //remember portion of expression before cell name.
        expressionStart = expression.substr(0,SUMAVG.index);
        //remember portion after.
        expressionEnd = expression.substr(SUMAVG.index+SUMAVG[0].length);
        //Get beginning of cell range from SUM or AVG function
        cellNames = SUMAVG[0].match(cellRE);
        var cellRow = getRowFromNumber(cellNames[0].substr(1));
        var cellCol = getColFromChar(cellNames[0].charAt(0));
        //Get end of cell range
        cellNames = SUMAVG[0].substr(SUMAVG[0].indexOf(":")).match(cellRE);
        var cellRow2 = getRowFromNumber(cellNames[0].substr(1));
        var cellCol2 = getColFromChar(cellNames[0].charAt(0));
        var details = {};
        details.row = cellRow;
        details.col = cellCol;
        details.endRow = cellRow2;
        details.endCol = cellCol2;
        if(SUMAVG[0].indexOf("SUM")==0)
          insert = functionSUM(details);
        else
          insert = functionAVG(details);
        expression = expressionStart+insert+expressionEnd;
        //error returned as true
        if(updateDependencyByDetails(details, selectedCell))
        {
          return "#ERROR"
        }
        SUMAVG = expression.match(SUMAVGRE);
      }
      var cellNames = expression.match(cellRE);
      //cycle through occurences of cell names.
      while(cellNames!==null)
      {
          var expressionStart;
          var expressionEnd;
          var insert;
          var cellRow = getRowFromNumber(cellNames[0].substr(1));
          var cellCol = getColFromChar(cellNames[0].charAt(0));
          //remember portion of expression before cell name.
          expressionStart = expression.substr(0,cellNames.index);
          //remember portion after.
          expressionEnd = expression.substr(cellNames.index+cellNames[0].length);
          //get value of cell
          insert=ht.getDataAtCell(cellRow, cellCol);
          insert=convertCellTextToNumber(insert);
          if(insert===null)
            insert=0;
          //reform the expression string
          expression = expressionStart+insert+expressionEnd;
          //update dependency table
          fillUsedBy(cellRow, cellCol, selected[0], selected[1], true);
          fillDependantOn(selected[0],selected[1],cellRow,cellCol, true);
          if(dependantOn[cellRow]!==undefined && dependantOn[cellRow][cellCol]!==undefined && 
          dependantOn[cellRow][cellCol][selected[0]]!==undefined &&
          dependantOn[cellRow][cellCol][selected[0]][selected[1]]!==undefined &&
          dependantOn[cellRow][cellCol][selected[0]][selected[1]])
          {
            return "#ERROR";
          }
          cellNames = expression.match(cellRE);
      }
      if(expression.indexOf("#ERROR")>=0)
      {
        return "#ERROR";
      }
      else
        return eval(expression).toString();
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

//Fills an element of the table usedBy, ensuring that
//each dimension of the table is defined
function fillUsedBy(row1, col1, row2, col2, value)
{
  if(usedBy[row1]===undefined)
    usedBy[row1] =[];
  if(usedBy[row1][col1]===undefined)
    usedBy[row1][col1] =[];
  if(usedBy[row1][col1][row2]===undefined)
    usedBy[row1][col1][row2] =[];
  usedBy[row1][col1][row2][col2] = value;
}

function fillDependantOn(row1, col1, row2, col2, value)
{
  if(dependantOn[row1]===undefined)
    dependantOn[row1] =[];
  if(dependantOn[row1][col1]===undefined)
    dependantOn[row1][col1] =[];
  if(dependantOn[row1][col1][row2]===undefined)
    dependantOn[row1][col1][row2] =[];
  dependantOn[row1][col1][row2][col2] = value;
}

function convertCellTextToNumber(string)
{
  if(string!==undefined && string!== null)
  {
    //handle monetary values
    string = string.replace("$","");
    //checks if result is number
    string = parseFloat(string);
    if(isNaN(string))
    {
      string="#ERROR";
    }
  }
  return string;
}


