// Use to repopulate survey questionnaire to contain latest departments with associating UUID, title in english and title in french

const fs = require("fs");
const path = require("path");
var request = require("request");
const surveyfile = path.join(__dirname, "..", "src", "survey-enfr.json");
// eslint-disable-next-line security/detect-non-literal-fs-filename
let surveyJSON = JSON.parse(fs.readFileSync(surveyfile));
request.get("https://open.canada.ca/static/orgs.csv", function(
  error,
  response,
  body
) {
  if (!error && response.statusCode == 200) {
    var csvDept = body;
    //console.log(csvDept);
    var uuid = [];
    var title_en = [];
    var title_fr = [];
    //Size used to find the length of the most uptodate list on the orgs.csv file
    var size = processData(csvDept, uuid, title_en, title_fr);

    //To iterate to proper fields of where departments are being showcased
    for (lines in surveyJSON) {
      if (lines == "pages") {
        // eslint-disable-next-line security/detect-object-injection
        for (i = 0; i < surveyJSON[lines].length; i++) {
          // eslint-disable-next-line security/detect-object-injection
          if (surveyJSON[lines][i].name == "projectDetails") {
            // eslint-disable-next-line security/detect-object-injection
            //Maps out current value to UUID, english title and french title.
            //console.log(surveyJSON[lines][i].elements[0].elements[1].title);

            
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
    // We read the key,1st, 2nd and 3rd rows
    uuid.push(values[0]); // Read in as string
    // Recommended to read in as float, since we'll be doing some operations on this later.
    titleEn.push(values[1]);
    titleFr.push(values[2]);
  }
  return lines.length;
}