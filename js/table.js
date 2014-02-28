/*
 * This handles the functionality of the table
 * */


$('#' + tableDiv.id).handsontable({
  minSpareRows: 30,
  minSpareCols: 20,
  height: 500,
  rowHeaders: true,
  colHeaders: true,
  outsideClickDeselects: false
});
