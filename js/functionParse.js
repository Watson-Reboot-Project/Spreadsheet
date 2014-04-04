//TODO: bette regular expressions.

function parseDetails()
{
	this.function = functionCall.NONE;
	this.row = 0;
	this.col = 0;
	this.endRow = 0;
	this.endCol = 0;
	return this;
}

//regular expression to determine if a string is a mathematical expression
//Does not handle parenthesis enclosation.
var expressionRE = /^[\d\+\-\/\*A-Z]+$/;
// /^(\d+|[A-Z][\d]+|(SUM|AVG)\([A-Z]\d+:[A-Z]\d+\))$/
//regular expression to determine if a string is a cell name.
var cellRE = /[A-Z][\d]+/;
var SUMAVGRE = /(SUM|AVG)\([A-Z]\d+:[A-Z]\d+\)/;
var innerParenthesis = /\([^\(\)]+\)/;

functionCall = { 
	SUM:0,
	AVG:1,
	EXPRESSION:2,
	NONE:3,
	ERROR:4       };

function functionParse(functionString)
{
	var details = new parseDetails();
	//Check if first character is equal. If so, parse function
	if(functionString!==null && functionString.charAt(0)=='=')
	{
		if(functionString.indexOf("SUM")==1)
		{
			details.function = functionCall.SUM;
		}
		else if(functionString.indexOf("AVG")==1)
		{
			details.function = functionCall.AVG;
		}
		else
		{
			//Not a cell function. Attempt to evaluate expression
			var substitute = substituteParenthesis(functionString.substr(1));
			console.log(substitute);
			if(expressionRE.test(substitute))
			{
        details.function = functionCall.EXPRESSION;
			}
			else
			{
        details.function = functionCall.ERROR;
			}
		}
		//Now search for range. I consider the string after the parenthesis.
    var indexOpen = functionString.indexOf("(");
    var indexColon = functionString.indexOf(":");
    var indexClose = functionString.indexOf(")");
		//parses for cell operations AVG and SUM
		if((details.function==functionCall.AVG||details.function==functionCall.SUM) && indexOpen>=0 && indexColon>=0 && indexClose>=0)
		{
			//Columns are stored in text form as upper-case ASCII letters. This finds
			//and converts their values to array indices.
			details.col=functionString.charCodeAt(indexOpen+1)-65;
			details.endCol=functionString.charCodeAt(indexColon+1)-65;
			//check if columns are represented as invalid numbers within the string.
			if(details.col<0||details.col-65>ht.countCols()||details.endCol<0||details.endCol-65>ht.countCols())
			{
        details.function = functionCall.ERROR;
        return details;
        handleInvalidInput();
			}
			//Rows are represented as number strings 
			details.row=parseInt(functionString.substring(indexOpen+2,indexColon))-1;
			details.endRow=parseInt(functionString.substring(indexColon+2,indexClose))-1;
			if(details.row<0||details.row>ht.countRows()||details.endRow<0||details.endRow>ht.countRows() || isNaN(details.row) || isNaN(details.endRow))
			{
        details.function = functionCall.ERROR;
        return details;
        handleInvalidInput();
			}
		}
		//attempt to resolve expression.
		else if(details.function == functionCall.EXPRESSION)
		{
      //Include everything after '='
      expressionString = functionString.substr(1);
      details.row = expressionString;
      
		}
		else
		{
      details.function = functionCall.ERROR;
      return details;
			handleInvalidInput();
		}
	}
	//If the first character is not an equals sign, ignore.
	else
	{
	}
	console.log(details);
	return details;
}

function getRowFromNumber(numberString)
{
  return parseInt(numberString)-1;
}

function getColFromChar(character)
{
  return character.charCodeAt(0)-65;
}

function handleInvalidInput(token)
{
	console.log("Invalid input");
}

//takes a string and attempts to match all expressions inside of parenthesis.
function substituteParenthesis(input)
{
  var substring = input.match(SUMAVGRE);
  //assume all sum and average functions are valid expressions
  while(substring!=null)
  {
    var inputStart = input[0].substr(0,substring.index);
    //remember portion after.
    var inputEnd = input.substr(substring.index+substring[0].length);
    var insert = 1;
    input = inputStart+insert+inputEnd;
    substring = input.match(SUMAVGRE);
  }
  substring = input.match(innerParenthesis);
  while(substring!==null)
  {
    console.log(substring);
    //remember portion of expression before cell name.
    var inputStart = input[0].substr(0,substring.index);
    //remember portion after.
    var inputEnd = input.substr(substring.index+substring[0].length);
    var insert = "#ERROR";
    if(expressionRE.test(substring[0].substr(1,substring[0].length-2)))
    {
      insert = "1";
    }
    input = inputStart+insert+inputEnd;
    substring = input.match(innerParenthesis);
  }
  return input;
}