//Script is called by running "npm run update-depts"
//Can be viewed in package.json

// Use to repopulate survey questionnaire to contain latest departments with associating UUID, title in english and title in french
const fs = require("fs");
const path = require("path");
var request = require("request");
//Used to find pathing to JSON file that will contain the department values we want.
const surveyfile = path.join(__dirname, "..", "src", "survey-enfr.json");

// eslint-disable-next-line security/detect-non-literal-fs-filename

//Reads the file and parses it into an object from string
let surveyJSON = JSON.parse(fs.readFileSync(surveyfile));
//Pulls values from csv file
request.get("https://open.canada.ca/static/orgs.csv", function(
  error,
  response,
  body
) {
  if (!error && response.statusCode == 200) {
    var csvDept = body;
    var uuid = [];
    var title_en = [];
    var title_fr = [];
    //Size used to find the length of the most up to date list on the orgs.csv file
    var size = processData(csvDept, uuid, title_en, title_fr);

    for (lines in surveyJSON) {
      if (lines == "pages") {
        // eslint-disable-next-line security/detect-object-injection
        for (i = 0; i < surveyJSON[lines].length; i++) {
          // eslint-disable-next-line security/detect-object-injection
          //Finding proper field that contains department text, french version and english version.
          if (surveyJSON[lines][i].name == "projectDetails") {
            // eslint-disable-next-line security/detect-object-injection
            //Maps out current value to UUID, english title and french title arrays.
            //LOOK AT SIZE - 1 AND COMPARE WITH PUTTING SIZE : BUG HERE 
            for (deptNum = 0; deptNum < size - 1; deptNum++) {
              surveyJSON[lines][i].elements[0].elements[4].choices[
                deptNum
              ].value = uuid[deptNum];
              surveyJSON[lines][i].elements[0].elements[4].choices[
                deptNum
              ].text.default = title_en[deptNum];
              surveyJSON[lines][i].elements[0].elements[4].choices[
                deptNum
              ].text.fr = title_fr[deptNum];

              //Overrides JSON file with latest updates to the departments
             fs.writeFileSync(surveyfile, JSON.stringify(surveyJSON, null, 4));
            }
          }
        }
      }
    }
  }
});

//This is the function thats creating the arrays to map out the AIA tool
function processData(data, uuid, titleEn, titleFr) {
  var lines = data.split(/\r\n|\n/);

  for (var j = 1; j < lines.length; j++) {
    var values = lines[j].split(","); // Split up the comma seperated values
    //Pushes values from file that has the comma as delimter to find specific fields such as UUID and english title and french title
    //Used to map into each of their own array that we then use to map out to the surveyJSON file.
    uuid.push(values[0]); 
    titleEn.push(values[1]);
    titleFr.push(values[2]);
  }
  return lines.length;
}

//BUGS ------------------------------------------------------------------------------------- 
//Note : Contains empty field that should not be there on survey-enfr.json (scroll to the last department) when putting size - 1. Putting size gives error lines #39
//Note : cleanup function that runs through the name of departments that gets rid of unnescaary characters such as quotations mark that are added but not suppose to be