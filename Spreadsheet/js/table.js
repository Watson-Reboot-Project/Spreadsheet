/*
 * This handles the functionality of the table and all touch/click/keypresses not handled
 * by the handsontable library.
 * */
 
 function Table(figNum) {

 	/*******************Public Methods***********************/
 	this.setMEditorManager = setMEditorManager;
 	this.getMEditorManager = getMEditorManager;

	 //Note by Mitchell Martin- I'm including the functionality of the input
	 //box in here too. Input/function boxes are an integral part of spreadsheet
	 //programs, and they are heavily intertwined.
	 var ib = $("#functionBox" + figNum);
	 this.ib = ib;
	 //for performance purposes, tracks when user has made input so that
	 //certain update functions can be skipped.
	 var recentChanges = false; 
	 //Creates a 4-dimensional table which stores data for which other cells use a certain cell.
	 //The way this is used is that the first two dimensions locate the cell which is depended on.
	 //The second two dimensions are for the dependant cells.
	 this.usedBy = [];
	//Creates a 4-dimensional table which stores data for which cells are used by the specified cell.
	//The first two dimensions locate the dependant cell. The last two represent cells which are
	//dependencies.
	this.dependantOn = [];
	//Note: for all dependencies, undefined is equivalent to false.
	//stores data for format
	var formatArray =[];
	this.formatArray = formatArray;
	//This keeps track of which cells are fully updated after changing the value of a cell on which
	//others are dependant
	var updateTable = [];
	this.updateTable = updateTable;
	//keeps track of whether cells are updating and which cell initiated the update cycle
	var updateState = [false, 0, 0];
	this.updateState = updateState;
	//handles touch events for scrolling at the top and left of the table.
	var timevert;
	var timehor;
	var scrollInterval = 120;
	
	var T, ht, AE, CF, FP;
	T = this;
	//enumerator for the six types of string formatting
	formatOption = {
	  ZERO:0,
	  ONE:1,
	  TWO:2,
	  THREE:3,
	  DOLLARS:4,
	  FNONE:5
	};
	this.formatOption = formatOption;
	formatOption = this.formatOption;
	//enumerator for the undo/redo tracking array.
	URTypes = 
	{
	  NORMAL:0,
	  FUNCTION:1,
	  UNDO:2,
	  REDO:3
	};
	this.URTypes = URTypes;
	this.URArray = [];
	this.URIndex = 0;
	this.URFlag = URTypes.NORMAL;
	 
	 ib.bind('input', function(event)
	 {
	  recentChanges = true;
		var selected = ht.getSelected();
		editor = meditorManager;
		editor.openEditorWithoutFocus();
		editor.getActiveEditor().setValue(ib.val());
		editor.getActiveEditor().refreshDimensions();
		//obsolete after using the editor
		//ht.setDataAtCell(selected[0],selected[1], ib.val());
	 });
	 
	 ib.keypress(function(event)
	 {
		if(event.which==13)
		{
			var selected = ht.getSelected();
			var temp = ib.val();
			pressEnter(event);
			//obsolete after updating cells on selection change
			//ht.setDataAtCell(selected[0],selected[1], temp);
		}
	 });

	//global variables
	var currSelect = [0,0,0,0];
	var funcTracker = new Array();
	this.funcTracker = funcTracker;
	var meditorManager;
	var currentEditor;
	var horDragDealer = 0;
	var vertDragDealer = 0;

	$("#WatsonTable" + figNum).handsontable({
	  minSpareRows: 30,
	  minSpareCols: 20,
	  maxRows: 30,
	  maxCols: 20,
	  height: 500,
	  rowHeaders: true,
	  colHeaders: true,
	  outsideClickDeselects: false
	}, T);

	//On page load..
	$(document).ready(function() {
	  //Default selected cell to 0,0
	  ht.selectCell(0,0);
		//set offset for buttons
		var offset = $("#" + AE.buttonDiv.id).offset();
		$("#" + AE.buttonDiv.id).offset({top: offset.top+55, left : offset.left});
		
		//button listeners
		$("#" + AE.undoButton.id).click(function() { CF.undo(); });
		$("#" + AE.redoButton.id).click(function() { CF.redo(); });
		$("#" + AE.sumButton.id).click(function() { CF.sum(); });
		$("#" + AE.cutButton.id).click(function() { CF.cut(); });
		$("#" + AE.copyButton.id).click(function() { CF.copy(); });
		$("#" + AE.pasteButton.id).click(function() { CF.paste(); });
		$("#" + AE.clearButton.id).click(function() { CF.clear(); });
		$("#" + AE.averageButton.id).click(function() { CF.average(); });
		$("#" + AE.formatButton.id).click(function() { CF.format(); });
		
		//Listen for any changes to cells.
		$("#" + AE.tableDiv.id).handsontable({
			afterChange: function(changes, source) {
	      if(T.URFlag == T.URTypes.NORMAL)
	      {
	        T.URArray[T.URIndex] = {};
	        T.URArray[T.URIndex].type = T.URTypes.NORMAL;
	        T.URIndex++;
	        T.URArray = T.URArray.slice(0,T.URIndex);
	      }
	      T.URFlag = T.URTypes.NORMAL;
				var selected = ht.getSelected();
				var isFunction = false
				var func = funcTracker[selected[0]*ht.countRows()+selected[1]];
				if(func!== undefined)
	        isFunction = true;
				/*for(var i = 0; i < funcTracker.length; i++) {
					if(funcTracker[i] !== undefined && funcTracker[i].row == selected[0] && funcTracker[i].col == selected[1]) {
	          CF.changeInput(funcTracker[i].funcString);
						isFunction = true;
						break;
					}*/
				//After a cell is changed, it needs to notify any cell that depends on it.
				CF.notifyDependants(changes[0][0], changes[0][1]);
				if(updateState[0] && updateState[1] == changes[0][0] && updateState[2] == changes[0][1])
				{
	        updateState[0] = false;
				}
				else
	        updateTable[changes[0][0]*ht.countRows()+changes[0][1]] = true;
				if(isFunction)
	        CF.changeInput(func.funcString);
				if(!isFunction)
				 CF.changeInput(ht.getDataAtCell(selected[0], selected[1]));
			}
		});
		
		//Listens for enter key. When detected, prevent the default action (edit cell) and move to a new one
		//while passing data from function tracking or input.
		//Mitchell's note- also looking for backspace and delete
		$("#" + AE.tableDiv.id).handsontable({
			beforeKeyDown: function(event) {
	      recentChanges = true;
	      editor = meditorManager.getActiveEditor();
	      //enter key
				if(event.which == 13) {
					pressEnter(event)
				}
				//backspace key
				if(event.which == 8)
				{
					ib.val(editor.TEXTAREA.value+String.fromCharCode(event.which));
					var caretPosition=editor.wtDom.getCaretPosition(editor.TEXTAREA);
					//This creates substrings of the textbox's text, up to but not including the
	        //caret (which is deleted) and everything after the caret.
					ib.val(ib.val().substr(0,caretPosition-1)+ib.val().substr(caretPosition));
				}
				//delete key
				if(event.which == 46)
				{
	        ib.val(editor.TEXTAREA.value+String.fromCharCode(event.which));
					var caretPosition=editor.wtDom.getCaretPosition(editor.TEXTAREA);
					//This creates substrings of the textbox's text, up to but not including the
	        //caret (which is deleted) and everything after the caret.
					ib.val(ib.val().substr(0,caretPosition)+ib.val().substr(caretPosition+1));
				}
			}
		});

		//handles ASCII keypresses. Specifically, I'm aiming to mirror the cell editor in
		//the input box.
		$("#" + AE.tableDiv.id).keypress(function(event)
		{
			//IMPORTANT NOTE BY MITCHELL-
			//The handsontable has no implemented method to access properties of editors.
			//To make this work, I created a reference to a previously private variable by editing the handsontable.js
			//file itself. I made a note of where the edit occured- ctrl+f MITCHELLSNOTE
			var editor = meditorManager.getActiveEditor();
			ib.val(editor.TEXTAREA.value);
			var caretPosition=editor.wtDom.getCaretPosition(editor.TEXTAREA);
			//copies everything up to and including the caret, adds the character to input box,
			//then continues along.
			ib.val(ib.val().substr(0,caretPosition)+String.fromCharCode(event.which)+ib.val().substr(caretPosition));
		});
		
			$("#" + AE.tableDiv.id).handsontable({
			onValidate: function()
			{
	    var selected = ht.getSelected();
	    ib.val(ht.getDataAtCell(selected[0], selected[1]));
	    }
	    });
		
		//Listens for selection changing
		$("#" + AE.tableDiv.id).handsontable({
			afterSelection: function(r, c, r2, c2) 
			{
	      if(ib.recentlyChanged)
	      {
	        func = funcTracker[currSelect[0]*ht.countRows()+currSelect[1]];
	        if(func!==undefined)
	          ht.setDataAtCell(currSelect[0], currSelect[1], func.funcString);
	        ib.recentlyChanged = false;
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
						CF.changeInput(funcTracker[i].funcString);
						isFunction = true;
						break;
					}
				}*/
	        if(isFunction)
	          CF.changeInput(func.funcString);
	        else
	          CF.changeInput(ht.getDataAtCell(selected[0], selected[1]));
	    }
		});

		//Instructions before setting value into a cell.
		$("#" + AE.tableDiv.id).handsontable({
			beforeSet: function e(value)
			{
	      var selected = {};
	      selected[0] =value.row;
	      selected[1] = value.prop;
	      selected[2] = value.value;
	      //this is the original cell that causes updates.
	      if(!updateState[0])
	      {
	        updateTable[selected[0]*ht.countRows()+selected[1]] = true;
	        if(T.usedBy[selected[0]]!==undefined && T.usedBy[selected[0]][selected[1]]!==undefined)
	        {
	        for(var i = 0; i<=T.usedBy[selected[0]][selected[1]].length; i++)
	         {
	          if(T.usedBy[selected[0]][selected[1]][i]!==undefined)
	          {
	              for(var k = 0; k<=T.usedBy[selected[0]][selected[1]][i].length; k++)
	              {
	                if(T.usedBy[selected[0]][selected[1]][i][k])
	                    CF.setUpdateTable(i,k);
	              }
	          }
	         }
	        }
	        updateState[0] = true;
	        updateState[1] = selected[0];
	        updateState[2] = selected[1];
	      }
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
	        CF.clearAssociations(selected[0],selected[1]);
					var details = FP.functionParse(value.value);
					if(details.function==FP.functionCall.SUM) //deprecated
					{
	          var cell = {};
	          cell.row = value.row;
	          cell.col = value.prop;
						value.value = functionSUM(details);
						var error = updateDependencyByDetails(details, cell);
						if(error)
	            value.value = "#ERROR";
					}
					else if(details.function==FP.functionCall.AVG) //deprecated
					{
	          var cell = {};
	          cell.row = value.row;
	          cell.col = value.prop;
						value.value = functionAVG(details);
						var error = updateDependencyByDetails(details, cell);
						if(error)
	            value.value = "#ERROR";
					}
					else if(details.function==FP.functionCall.EXPRESSION)
					{
	          var cell = {};
	          cell.row = value.row;
	          cell.col = value.prop;
	          value.value = CF.evaluateTableExpression(details.row, cell);
					}
	        else if(details.function==FP.functionCall.ERROR)
	        {
	          value.value = "#ERROR";
	        }
	        //check for format specified
	        if(formatArray[selected[0]]!==undefined &&
	        formatArray[selected[0]][selected[1]]!==undefined &&
	        formatArray[selected[0]][selected[1]].type[formatArray[selected[0]][selected[1]].index]!=formatOption.FNONE &&
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
	          var format = formatArray[selected[0]][selected[1]];
	          switch(format.type[format.index])
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
		//Giving all clicks with cells as the target makes mobile easier to handle.
		//$('#' + tableDiv.id).on('click', function(evt) {
	    //$('td').click(function(evt) {
	    $("#WatsonTable" + figNum +" td").click(function(evt){
			var selected = ht.getSelected();
			if(currSelect!==undefined && selected[0]==selected[2] && selected[1]==selected[3] &&
			selected[0]==currSelect[0] && selected[1]==currSelect[1])
	      meditorManager.openEditor();
			var func = funcTracker[selected[0]*ht.countRows()+selected[1]];
			if(func!==undefined)
			{
	      meditorManager.getActiveEditor().setValue(func.funcString);
	    }
			//Deprecated? Need to check during refactoring.
			currSelect = selected;
			/* obsolete with the introduction of function strings.
			if(selected != undefined) {
				var data = ht.getDataAtCell(selected[0], selected[1]);
				if(data != null) CF.changeInput(data);
			}*/
		});
		//Some mobile devices do not register mouseup events. Suffice to say, when
	  //there is a mousedown event, there must have been a preceding mouseup. This
	  //makes sure things are in their correct state.
	  $("#" + AE.tableDiv.id).on("mousedown", function(e)
	  {
	    horDragDealer.dragging = false;
	    vertDragDealer.dragging = false;
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
		currSelect = ht.getSelected();
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

	//Sets the meditormanager global variable
	function setMEditorManager(editor) {
		meditorManager = editor;
	}

	//Gets the meditormanager global variable
	this.getCurrentEditor = function() {
		return currentEditor;
	}
	
	this.setCurrentEditor = function(editor) {
		currentEditor = editor;
	}

	//Gets the meditormanager global variable
	function getMEditorManager() {
		return meditorManager;
	}
	
	this.getObjects = function(cellFunctions, addElements, functionParse)
	{
    if(ht===undefined)
      ht = cellFunctions.ht;
    CF = cellFunctions;
    AE = addElements;
    FP = functionParse;
	}
}