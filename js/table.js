/*
 * This handles the functionality of the table
 * */
 
 //Note by Mitchell Martin- I'm including the functionality of the input
 //box in here too. Input/function boxes are an integral part of spreadsheet
 //programs, and they are heavily intertwined.
 var ib = $("#"+input.id);
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
var currSelect;
var funcTracker = new Array();
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
      console.log(changes[0][3]);
			var selected = ht.getSelected();
			var isFunction = false
			for(var i = 0; i < funcTracker.length; i++) {
				if(funcTracker[i] !== undefined && funcTracker[i].row == selected[0] && funcTracker[i].col == selected[1]) {
					changeInput(funcTracker[i].funcString);
					isFunction = true;
					break;
				}
			}
			if(!isFunction) changeInput(ht.getDataAtCell(selected[0], selected[1]));
		}
	});
	
	//Listens for enter key. When detected, prevent the default action (edit cell) and move to a new one
	//while passing data from function tracking or input.
	//Mitchell's note- also looking for backspace and delete
	$("#" + tableDiv.id).handsontable({
		beforeKeyDown: function(event) {
			if(event.which == 13) {
				pressEnter(event)
			}
			if(event.which == 8)
			{
				//TODO: get caret position for reliable insertion/deletion
				console.log(currentEditor.wtDom);
				console.log(currentEditor);
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
		ib.val(currentEditor.TEXTAREA.value+String.fromCharCode(event.which));
	});
	
		$("#" + tableDiv.id).handsontable({
		onValidate: function()
		{
    var selected = ht.getSelected();
    console.log(ht.getDataAtCell(selected[0], selected[1]));
    ib.val(ht.getDataAtCell(selected[0], selected[1]));
    }
    });
	
	//Listens for selection changing
	$("#" + tableDiv.id).handsontable({
		afterSelection: function(r, c, r2, c2) {
			var selected = ht.getSelected();
			var isFunction = false;
			for(var i = 0; i < funcTracker.length; i++) {
				if(funcTracker[i] !== undefined && funcTracker[i].row == selected[0] && funcTracker[i].col == selected[1]) {
					changeInput(funcTracker[i].funcString);
					isFunction = true;
					break;
				}
			}
			if(!isFunction) changeInput(ht.getDataAtCell(selected[0], selected[1]));
		}
	});

	//Instructions before setting value into a cell.
	$("#" + tableDiv.id).handsontable({
		beforeSet: function(value)
		{
      console.log(value);
      var selected = {};
      selected[0] =value.row;
      selected[1] = value.prop;
      selected[2] = value.value;
      fillFuncTracker(selected);
      var func = funcTracker[selected[0]*ht.countRows()+selected[1]];
      func.funcString = value.value;
			if(!(ib.is(":focus")))
			{
        console.log("hi");
				var details = functionParse(value.value);
				if(details.function==functionCall.SUM)
				{
					value.value = functionSUM(details);
				}
				else if(details.function==functionCall.AVG)
				{
					value.value = functionAVG(details);
				}
			}
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

//Handles functionality of whenever the enter key is pressed. This should be the
//same regardless of whether the input field or table is focused.
function pressEnter(event)
{
	ib.blur();
	var selected = ht.getSelected();
	if(!event.shiftKey)
	{
		//event.stopImmediatePropagation();
		ht.selectCell(selected[0]+1, selected[1]);
	}
	else
	{
		//event.stopImmediatePropagation();
		ht.selectCell(selected[0]-1, selected[1]);
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
