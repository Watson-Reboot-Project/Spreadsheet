/*
 * This handles the functionality of the table and all touch/click/keypresses not handled
 * by the handsontable library.
 * */
 
 
 //Note by Mitchell Martin- I'm including the functionality of the input
 //box in here too. Input/function boxes are an integral part of spreadsheet
 //programs, and they are heavily intertwined.
 var ib = $("#"+functionBox.id);
 
 //Creates a 4-dimensional table which stores data for which other cells use a certain cell.
 //The way this is used is that the first two dimensions locate the cell which is depended on.
 //The second two dimensions are for the dependant cells.
 var usedBy = [];
//Creates a 4-dimensional table which stores data for which cells are used by the specified cell.
//The first two dimensions locate the dependant cell. The last two represent cells which are
//dependencies.
var dependantOn =[];
//Note: for all dependencies, undefined is equivalent to false.
//stores data for format
var formatArray =[];
//enumerator for the six types of string formatting
formatOption = {
  ZERO:0,
  ONE:1,
  TWO:2,
  THREE:3,
  DOLLARS:4,
  FNONE:5
};
 
 ib.bind('input', function(event)
 {
	var selected = ht.getSelected();
	ht.setDataAtCell(selected[0],selected[1], ib.val());
 });
 
 ib.keypress(function(event)
 {
	if(event.which==13)
	{
		var selected = ht.getSelected();
		var temp = ib.val();
		pressEnter(event);
		ht.setDataAtCell(selected[0],selected[1], temp);
	}
 });

//global variables
var currSelect = [0,0,0,0];
var funcTracker = new Array();
var meditorManager;
var currentEditor;

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
  //Default selected cell to 0,0
  ht.selectCell(0,0);
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
			var func = funcTracker[selected[0]*ht.countRows()+selected[1]];
			if(func!== undefined)
        isFunction = true;
			/*for(var i = 0; i < funcTracker.length; i++) {
				if(funcTracker[i] !== undefined && funcTracker[i].row == selected[0] && funcTracker[i].col == selected[1]) {
          changeInput(funcTracker[i].funcString);
					isFunction = true;
					break;
				}*/
			//After a cell is changed, it needs to notify any cell that depends on it.
			notifyDependants(changes[0][0], changes[0][1]);
			if(isFunction)
        changeInput(func.funcString);
			if(!isFunction)
			 changeInput(ht.getDataAtCell(selected[0], selected[1]));
		}
	});
	
	//Listens for enter key. When detected, prevent the default action (edit cell) and move to a new one
	//while passing data from function tracking or input.
	//Mitchell's note- also looking for backspace and delete
	$("#" + tableDiv.id).handsontable({
		beforeKeyDown: function(event) {
      //enter key
			if(event.which == 13) {
				pressEnter(event)
			}
			//backspace key
			if(event.which == 8)
			{
				ib.val(currentEditor.TEXTAREA.value+String.fromCharCode(event.which));
				var caretPosition=currentEditor.wtDom.getCaretPosition(currentEditor.TEXTAREA);
				//This creates substrings of the textbox's text, up to but not including the
        //caret (which is deleted) and everything after the caret.
				ib.val(ib.val().substr(0,caretPosition-1)+ib.val().substr(caretPosition));
			}
			//delete key
			if(event.which == 46)
			{
        ib.val(currentEditor.TEXTAREA.value+String.fromCharCode(event.which));
				var caretPosition=currentEditor.wtDom.getCaretPosition(currentEditor.TEXTAREA);
				//This creates substrings of the textbox's text, up to but not including the
        //caret (which is deleted) and everything after the caret.
				ib.val(ib.val().substr(0,caretPosition)+ib.val().substr(caretPosition+1));
			}
		}
	});

	//handles ASCII keypresses. Specifically, I'm aiming to mirror the cell editor in
	//the input box.
	$("#" + tableDiv.id).keypress(function(event)
	{
		//IMPORTANT NOTE BY MITCHELL-
		//The handsontable has no implemented method to access properties of editors.
		//To make this work, I created a reference to a previously private variable by editing the handsontable.js
		//file itself. I made a note of where the edit occured- ctrl+f MITCHELLSNOTE
		ib.val(currentEditor.TEXTAREA.value);
		var caretPosition=currentEditor.wtDom.getCaretPosition(currentEditor.TEXTAREA);
		//copies everything up to and including the caret, adds the character to input box,
		//then continues along.
		ib.val(ib.val().substr(0,caretPosition)+String.fromCharCode(event.which)+ib.val().substr(caretPosition));
	});
	
		$("#" + tableDiv.id).handsontable({
		onValidate: function()
		{
    var selected = ht.getSelected();
    ib.val(ht.getDataAtCell(selected[0], selected[1]));
    }
    });
	
	//Listens for selection changing
	$("#" + tableDiv.id).handsontable({
		afterSelection: function(r, c, r2, c2) {
      if(currSelect!==undefined)
      {
        func = funcTracker[currSelect[0]*ht.countRows()+currSelect[1]];
        if(func!==undefined)
          ht.setDataAtCell(currSelect[0], currSelect[1], func.funcString);
      }
			var selected = ht.getSelected();
      /*if(usedBy[selected[0]]!==undefined && usedBy[selected[0]][selected[1]]!==undefined)
        console.log(usedBy[selected[0]][selected[1]]);
      if(dependantOn[selected[0]]!==undefined && dependantOn[selected[0]][selected[1]]!==undefined)
        console.log(dependantOn[selected[0]][selected[1]]);*/
      var isFunction = false;
			var func = funcTracker[selected[0]*ht.countRows()+selected[1]];
			if(func!== undefined)
        isFunction = true;
			/*for(var i = 0; i < funcTracker.length; i++) {
				if(funcTracker[i] !== undefined && funcTracker[i].row == selected[0] && funcTracker[i].col == selected[1]) {
					changeInput(funcTracker[i].funcString);
					isFunction = true;
					break;
				}
			}*/
			if(isFunction)
        changeInput(func.funcString);
			else
        changeInput(ht.getDataAtCell(selected[0], selected[1]));
		}
	});

	//Instructions before setting value into a cell.
	$("#" + tableDiv.id).handsontable({
		beforeSet: function(value)
		{
      var selected = {};
      selected[0] =value.row;
      selected[1] = value.prop;
      selected[2] = value.value;
      fillFuncTracker(selected);
      var func = funcTracker[selected[0]*ht.countRows()+selected[1]];
      func.funcString = value.value;
      //Using the cell editor does not set a cell's value until
      //the selected cell changes. While using the text box, I use the setData
      //method to change the display value of a cell. So this test prevents any
      //sort of function string handling while cells are being edited.
			if(!(ib.is(":focus")))
			{
        //Since the function string has changed, begin by discarding all cells this cell
        //previously depended on.
        clearAssociations(selected[0],selected[1]);
				var details = functionParse(value.value);
				if(details.function==functionCall.SUM) //deprecated
				{
          var cell = {};
          cell.row = value.row;
          cell.col = value.prop;
					value.value = functionSUM(details);
					var error = updateDependencyByDetails(details, cell);
					if(error)
            value.value = "#ERROR";
				}
				else if(details.function==functionCall.AVG) //deprecated
				{
          var cell = {};
          cell.row = value.row;
          cell.col = value.prop;
					value.value = functionAVG(details);
					var error = updateDependencyByDetails(details, cell);
					if(error)
            value.value = "#ERROR";
				}
				else if(details.function==functionCall.EXPRESSION)
				{
          var cell = {};
          cell.row = value.row;
          cell.col = value.prop;
          value.value = evaluateTableExpression(details.row, cell);
				}
        else if(details.function==functionCall.ERROR)
        {
          value.value = "#ERROR";
        }
        //check for format specified
        if(formatArray[selected[0]]!==undefined &&
        formatArray[selected[0]][selected[1]]!==undefined &&
        formatArray[selected[0]][selected[1]]!=formatOption.FNONE &&
        !isNaN(parseFloat(value.value)))
        {
          var index = value.value.indexOf('.');
          if(index>=0)
          {
            value.value =value.value+"000";
          }
          else
          {
            index = value.value.length;
            value.value =value.value+".000";
          }
          switch(formatArray[selected[0]][selected[1]])
          {
            case formatOption.ZERO:
              value.value = value.value.substr(0,index);
              break;
            case formatOption.ONE:
              value.value = value.value.substr(0,index+2);
              break;
            case formatOption.TWO:
              value.value = value.value.substr(0,index+3);
              break;
            case formatOption.THREE:
              value.value = value.value.substr(0,index+4);
              break;
            case formatOption.DOLLARS:
              value.value = "$"+value.value.substr(0, index+3);
              break;
          }
        }
			}
		}

	});
	
	//Listens for double click MITCHELL'S NOTE
	//Editor works just as well as typing into the cell itself.
	//Giving all clicks this functionality makes mobile easier to handle.
	$('#' + tableDiv.id).on('click', function(evt) {
		var selected = ht.getSelected();
		if(selected[0]==selected[2] && selected[1]==selected[3] &&
		selected[0]==currSelect[0] && selected[1]==currSelect[1])
      meditorManager.openEditor();
		var func = funcTracker[selected[0]*ht.countRows()+selected[1]];
		if(func!==undefined)
		{
      currentEditor.setValue(func.funcString);
    }
		//Deprecated? Need to check during refactoring.
		currSelect = selected;
		/* obsolete with the introduction of function strings.
		if(selected != undefined) {
			var data = ht.getDataAtCell(selected[0], selected[1]);
			if(data != null) changeInput(data);
		}*/
	});
	
});

//Handles functionality of whenever the enter key is pressed. This should be the
//same regardless of whether the input field or table is focused.
function pressEnter(event)
{
	ib.blur();
	var selected = ht.getSelected();
	if(!event.shiftKey)
	{
		event.stopImmediatePropagation();
		ht.selectCell(selected[0]+1, selected[1], selected[0]+1, selected[1], true);
	}
	else
	{
		event.stopImmediatePropagation();
		ht.selectCell(selected[0]-1, selected[1], selected[0]-1, selected[1], true);
	}
}

function fillFuncTracker(selected)
{
  if(funcTracker[selected[0]*ht.countRows()+selected[1]] === undefined)
	{
    funcTracker[selected[0]*ht.countRows()+selected[1]] = {};
    var func = funcTracker[selected[0]*ht.countRows()+selected[1]];
    func.row=selected[0];
    func.col=selected[1];
	}
}
