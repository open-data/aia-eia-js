<template>
  <div class="home">
    <h1>{{ $t("appTitle") }}</h1>
    <p>
      <a
        class="btn btn-default pull-right"
        role="button"
        :href="$t(linkProjectAnchor)"
      >
        {{ $t("linkProjectText") }}
      </a>
    </p>

    <div class="alert alert-info">
      <p class="small">{{ $t("localSaveWarning") }}</p>
    </div>

    <form>
      <ActionButtonBar
        v-on:fileLoaded="fileLoaded($event)"
        v-on:startAgain="startAgain"
      />
    </form>
    <AssessmentTool :survey="Survey" />
    <Score />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Model } from "survey-vue";
import showdown from "showdown";

import AssessmentTool from "@/components/AssessmentTool.vue"; // @ is an alias to /src
import Score from "@/components/Score.vue";
import ActionButtonBar from "@/components/ActionButtonBar.vue";
import SurveyFile from "@/interfaces/SurveyFile";
import i18n from "@/plugins/i18n";
import { RootState } from "@/types";
import surveyJSON from "@/survey-enfr.json";

@Component({
  components: {
    AssessmentTool,
    ActionButtonBar,
    Score
  }
})
export default class Home extends Vue {
  Survey: Model = new Model(surveyJSON);
  startAgain() {
    this.Survey.clear(true, true);
    window.localStorage.clear();
    this.$store.commit("resetSurvey");
  }
  fileLoaded($event: SurveyFile) {
    this.Survey.data = $event.data;
    this.Survey.currentPageNo = $event.currentPage;
    this.Survey.start();
    this.$store.commit("updateResult", this.Survey);
  }

  created() {
    this.Survey.onComplete.add(result => {
      this.$store.commit("updateResult", result);
    });

    this.Survey.onComplete.add(result => {
      this.$router.push("Results");
    });

    this.Survey.onValueChanged.add(result => {
      this.$store.commit("updateResult", result);
    });
    /*
      console.log(this.Survey.data);
      //console.log(this.Survey.getValue("projectDetailsDepartment"));

      //console.log(document.getElementsByTagName("option")[this.Survey.getValue("projectDetailsDepartment")].innerHTML);
      //Starting value for option array list - 311
      var startingValueForSubjects = 311;
      var indexNumberForSubject =
        Number(this.Survey.getValue("projectSubject")) +
        startingValueForSubjects;

      //Displays Current Subject Number
      //console.log(document.getElementsByTagName("option")[indexNumberForSubject].innerHTML);

      request.get("https://open.canada.ca/static/orgs.csv", function(
        error,
        response,
        body
      ) {
        if (!error && response.statusCode == 200) {
          var csvDept: any = body;
          //console.log(csvDept);
          var uuid: any = [];
          var title_en: any = [];
          var title_fr: any = [];
          //Size used to find the length of the most uptodate list on the orgs.csv file
          var size: int = processData(csvDept, uuid, title_en, title_fr);

          for (i = 0; i < size; i++) {
            // eslint-disable-next-line security/detect-object-injection
            if (uuid[i] == this.Survey.getValue("projectDetailsDepartment")) {
              //registryJSON["result"].org_title_at_publication.en = title_en[i]
              //registryJSON["result"].org_title_at_publication.fr =  title_fr[i]
            }
          }
        }
      });
      //This is the function thats creating the arrays to map out the AIA tool
      function processData(data: any, uuid: any, titleEn: any, titleFr: any) {
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
    });
*/
    const converter = new showdown.Converter();

    this.Survey.onTextMarkdown.add(function(survey, options) {
      //convert the markdown text to html
      var str = converter.makeHtml(options.text);
      //remove root paragraphs <p></p>
      str = str.substring(3);
      str = str.substring(0, str.length - 4);
      //set html
      options.html = str;
    });

    // Set locale
    this.Survey.locale = i18n.locale;

    // Remove the default required '*'.
    this.Survey.requiredText = "";

    // Fix all the question labels as they're using <H5> instead of <label>
    // as SurveyJS has open issue as per: https://github.com/surveyjs/surveyjs/issues/928
    this.Survey.onAfterRenderQuestion.add(function(sender, options) {
      let title = options.htmlElement.getElementsByTagName("H5")[0];
      if (title) {
        var questionRequiredHTML = "";

        if (options.question.isRequired) {
          // Should do localization mechanism
          var requiredText = sender.locale == "fr" ? "obligatoire" : "required";
          questionRequiredHTML =
            ' <strong class="required">(' + requiredText + ")</strong>";
        }

        title.outerHTML =
          '<label for="' +
          options.question.inputId +
          '" class="' +
          title.className +
          '"><span class="field-name">' +
          title.innerText +
          "</span>" +
          questionRequiredHTML +
          "</label>";
      }
    });
    //if survey is in progress reload from store
    if (this.$store.getters.inProgress) {
      this.fileLoaded({
        currentPage: this.$store.state.currentPageNo,
        data: this.$store.state.toolData
      } as SurveyFile);
    }
  }
}
</script>
