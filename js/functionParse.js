function parseDetails()
{
	this.function = functionCall.NONE;
	this.row = 0;
	this.col = 0;
	this.endRow = 0;
	this.endCol = 0;
	return this;
}

functionCall = { 
	SUM:0,
	AVG:1,
	NONE:2 };

function functionParse(functionString)
{
	var details = new parseDetails();
	//Check if first character is equal. If so, parse function
	if(functionString.charAt(0)=='=')
	{
		if(functionString.indexOf("SUM")!=-1)
		{
			details.function = functionCall.SUM;
		}
		else if(functionString.indexOf("AVG")!=-1)
		{
			details.function = functionCall.AVG;
		}
		else
		{
			//unknown command. Throw error and return no function found.
			handleInvalidInput();
			details.function = functionCall.NONE;
			return details;
		}
		//TODO: substring based on comma, parse rows.
		//Now search for range. I consider the string after the parenthesis.
		var indexOpen = functionString.indexOf("(");
		var indexColon = functionString.indexOf(":");
		var indexClose = functionString.indexOf(")");
		if((details.function==functionCall.AVG||details.function==functionCall.SUM) && indexOpen>=0 && indexColon>=0 && indexClose>=0)
		{
			//Columns are stored in text form as upper-case ASCII letters. This finds
			//and converts their values to array indices.
			details.col=functionString.charCodeAt(indexOpen+1)-65;
			details.endCol=functionString.charCodeAt(indexColon+1)-65;
			//Rows are represented as number strings 
			details.row=parseInt(functionString.substring(indexOpen+2,indexColon))-1;
			details.endRow=parseInt(functionString.substring(indexColon+2,indexClose))-1;
		}
		else
		{
			handleInvalidInput();
		}
	}
	//If the first character is not an equals sign, ignore.
	else
	{
	}
	return details;
}

function handleInvalidInput(token)
{
	console.log("Invalid input");
}