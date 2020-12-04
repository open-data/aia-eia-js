// download latest CSV

// read existing survey.json into an object
// delete depart array, repopulate

const fs = require("fs");
var request = require("request");

let surveyJSON = JSON.parse(
  fs.readFileSync(
    "/mnt/c/Users/errad/OneDrive/Documents/newTBS/aia-eia-js/src/survey-enfr.json"
  )
);
request.get("https://open.canada.ca/static/orgs.csv", function(
  error,
  response,
  body
) {
  if (!error && response.statusCode == 200) {
    var csvDept = body;
    //console.log(csvDept);
    processData(csvDept);
    // Continue with your processing here.
  }
});

function processData(data) {
  var lines = data.split(/\r\n|\n/);

  //Set up the data arrays
  var uuid = [];
  var title_en = [];
  var title_fr = [];

  var headings = lines[0].split(","); // Splice up the first row to get the headings

  for (var j = 1; j < lines.length; j++) {
    var values = lines[j].split(","); // Split up the comma seperated values
    // We read the key,1st, 2nd and 3rd rows
    uuid.push(values[0]); // Read in as string
    // Recommended to read in as float, since we'll be doing some operations on this later.
    title_en.push(values[1]);
    title_fr.push(values[2]);
  }
}

for (lines in surveyJSON) {
  if (lines == "pages") {
    for (pageNumber in lines) {
      console.log(pageNumber.elements);
    }
  }
}

/*

iterate through surveyJSON
    departmnets
    deleting every5hing withing trhe choice section [i]
    add back department vals from csv
*/

//fs.writeFileSycn(surveyJSON,"survey-enfr.json")

// write back updated surve-enfr.json
// check into source if needed
