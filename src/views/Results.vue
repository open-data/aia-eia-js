<template>
  <div class="results">
    <!--<PrintButton />-->
    <h1>{{ $t("resultTitle") }}</h1>
    <p>
      <a
        class="btn btn-default pull-right"
        role="button"
        :href="$t(linkProjectAnchor)"
      >
        {{ $t("linkProjectText") }}
      </a>
    </p>
    <form>
      <ActionButtonBar
        v-on:fileLoaded="fileLoaded($event)"
        v-on:startAgain="startAgain"
      />
    </form>

    <div class="alert alert-info">
      <p class="small">{{ $t("localSaveWarning") }}</p>
    </div>

    <p>{{ $t("onThisPage") }}</p>
    <ul>
      <li>
        <a href="#score">{{ "Section 1: " + $t("riskLevel") }}</a>
      </li>
      <li>
        <a href="#obligations">{{ $t("requirements.title") }}</a>
      </li>
      <li>
        <a href="#qA">{{ "Section 3: " + $t("resultSectionQA") }}</a>
        <ul>
          <li>
            <a href="#projectDetails">{{
              "Section 3.1: " + $t("resultSectionPD")
            }}</a>
          </li>
          <li>
            <a href="#riskQA">{{ "Section 3.2: " + $t("resultSectionRQA") }}</a>
          </li>
          <li>
            <a href="#mitigationQA">{{
              "Section 3.3: " + $t("resultSectionMQA")
            }}</a>
          </li>
        </ul>
      </li>
    </ul>

    <div id="results-printable">
      <Score />
      <Obligations />

      <div class="container-fluid">
        <div class="row">
          <h2 id="qA">{{ "Section 3: " + $t("resultSectionQA") }}</h2>
        </div>

        <div class="row">
          <h3 id="projectDetails">
            {{ "Section 3.1: " + $t("resultSectionPD") }}
          </h3>
        </div>
        <div class="row" v-for="result in myResults[0]" :key="result.name">
          <Result :data="result"></Result>
        </div>

        <div class="row">
          <h3 id="riskQA">{{ "Section 3.2: " + $t("resultSectionRQA") }}</h3>
        </div>
        <div class="row" v-for="result in myResults[1]" :key="result.name">
          <Result :data="result"></Result>
        </div>

        <div class="row">
          <h3 id="mitigationQA">
            {{ "Section 3.3: " + $t("resultSectionMQA") }}
          </h3>
        </div>
        <div class="row" v-for="result in myResults[2]" :key="result.name">
          <Result :data="result"></Result>
        </div>
      </div>
    </div>

    <div style="margin-bottom:15px;">
      <h1>{{ $t("export") }}</h1>
      <button
        type="button"
        value="Export Results"
        class="btn btn-default"
        onclick="exportResults('en')"
      >
        {{ $t("exportEnglishResults") }}
      </button>

      <button
        type="button"
        value="Export Results"
        class="btn btn-default"
        onclick="exportResults('fr')"
      >
        {{ $t("exportFrenchResults") }}
      </button>
    </div>

    <details id="en-content-wrap">
      <summary>{{ $t("englishContent") }}</summary>
      <div id="en-content" lang="en">
        <h1>{{ $t("resultTitle", "en") }}</h1>

        <div class="row" v-for="result in myResults[0]" :key="result.name">
          <Result :data="result" locale="en"></Result>
        </div>
        <br />
        <Score locale="en" />
        <Obligations locale="en" />
        <div class="container-fluid">
          <div class="row">
            <h2 id="qA">{{ "Section 3: " + $t("resultSectionQA", "en") }}</h2>
          </div>

          <div class="row">
            <h3 id="riskQA">
              {{ "Section 3.1: " + $t("resultSectionRQA", "en") }}
            </h3>
          </div>
          <div class="row" v-for="result in myResults[1]" :key="result.name">
            <Result :data="result" locale="en"></Result>
          </div>

          <div class="row">
            <h3 id="mitigationQA">
              {{ "Section 3.2: " + $t("resultSectionMQA", "en") }}
            </h3>
          </div>
          <div class="row" v-for="result in myResults[2]" :key="result.name">
            <Result :data="result" locale="en"></Result>
          </div>
        </div>
      </div>
    </details>

    <details id="fr-content-wrap">
      <summary>{{ $t("frenchContent") }}</summary>
      <div id="fr-content" lang="fr">
        <h1>{{ $t("resultTitle", "fr") }}</h1>

        <div class="row" v-for="result in myResults[0]" :key="result.name">
          <Result :data="result" locale="fr"></Result>
        </div>
        <br />
        <Score locale="fr" />
        <Obligations locale="fr" />

        <div class="container-fluid">
          <div class="row">
            <h2 id="qA">{{ "Section 3: " + $t("resultSectionQA", "fr") }}</h2>
          </div>

          <div class="row">
            <h3 id="riskQA">
              {{ "Section 3.1: " + $t("resultSectionRQA", "fr") }}
            </h3>
          </div>
          <div class="row" v-for="result in myResults[1]" :key="result.name">
            <Result :data="result" locale="fr"></Result>
          </div>

          <div class="row">
            <h3 id="mitigationQA">
              {{ "Section 3.2: " + $t("resultSectionMQA", "fr") }}
            </h3>
          </div>
          <div class="row" v-for="result in myResults[2]" :key="result.name">
            <Result :data="result" locale="fr"></Result>
          </div>
        </div>
      </div>
    </details>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

import { Model } from "survey-vue";

import showdown from "showdown";

import AssessmentTool from "@/components/AssessmentTool.vue"; // @ is an alias to /src
import Score from "@/components/Score.vue";
import ActionButtonBar from "@/components/ActionButtonBar.vue";
import Result from "@/components/Result.vue";
import Obligations from "@/components/Obligations.vue";
import SurveyFile from "@/interfaces/SurveyFile";
import i18n from "@/plugins/i18n";
import surveyJSON from "@/survey-enfr.json";

@Component({
  components: {
    ActionButtonBar,
    Result,
    Score,
    Obligations
  },
  computed: {
    score: function() {
      return this.$store.getters.calcScore;
    }
  }
})
export default class Results extends Vue {
  myResults = this.$store.getters.resultDataSections;

  Survey: Model = new Model(surveyJSON);

  generateJSON(Survey: Model) {
    /* BUGS : __dirname is not defined line #260, 
              cannot pass in survey object correctly line #17
              to caputre subject value cannot be static line #298 - 299
                mapping of subject value line #318
    */
    const fs = require("fs");
    const path = require("path");
    const request = require("request");
    const registryfile = path.join(
      __dirname,
      "..",
      "src",
      "aia-metadata-info.json"
    );

    //Capture specifc elements
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    var registryJSON = JSON.parse(fs.readFileSync(registryfile));

    request.get("https://open.canada.ca/static/orgs.csv", function(
      error: any,
      response: any,
      body: any,
      registryJSON: any
    ) {
      if (!error && response.statusCode == 200) {
        var csvDept: any = body;
        //console.log(csvDept);
        var uuid: any = [];
        var title_en: any = [];
        var title_fr: any = [];
        //Size used to find the length of the most uptodate list on the orgs.csv file
        var size = processData(csvDept, uuid, title_en, title_fr);
        var deptField = Survey.getValue("projectDetailsDepartment");

        for (var i = 0; i < size; i++) {
          // eslint-disable-next-line security/detect-object-injection
          if (uuid[i] == deptField) {
            registryJSON["result"].org_title_at_publication.en = title_en[i];
            registryJSON["result"].org_title_at_publication.fr = title_fr[i];
          }
        }
      }
    });
    //Starting value for option array list is 311 which includes departements from 311 and lower
    //CANNOT BE STATIC, needs to be dynamic for ex. if someone addes a department 311 would be 312 instead
    var startingValueForSubjects = 311;
    var indexNumberForSubject =
      Number(this.Survey.getValue("projectSubject")) + startingValueForSubjects;

    console.log(registryJSON["result"]);

    var createdUUID = this.generateUUID();

    //Maps out UUID
    registryJSON["result"].UUID = createdUUID;

    //Maps out date
    registryJSON["result"].date_published = this.Survey.data.dateType;

    //Maps out Project Creator Name
    registryJSON["result"].creator = this.Survey.data.projectDetailsRespondent;

    //Maps out Email
    registryJSON[
      "result"
    ].maintainer_email = this.Survey.data.projectContactEmail;
    //This maps the departments UUID
    registryJSON[
      "result"
    ].owner_org = this.Survey.data.projectDetailsDepartment;

    //Maps out subject text (subject to change)
    registryJSON["result"].subject = indexNumberForSubject;

    //Maps out project detail title english
    registryJSON[
      "result"
    ].title_translated.en = this.Survey.data.projectDetailsTitleEn;

    //Maps out project detail title french
    registryJSON[
      "result"
    ].title_translated.fr = this.Survey.data.projectDetailsTitleFr;

    //Maps out project detail description (english)
    registryJSON[
      "result"
    ].notes_translated.en = this.Survey.data.projectDetailsDescriptionEn;

    //Maps out project detail description (french) 
    registryJSON[
      "result"
    ].notes_translated.fr = this.Survey.data.projectDetailsDescriptionFr;

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(registryfile, JSON.stringify(registryJSON, null, 4));

    //This is the function thats creating the arrays to map out the AIA tool
    function processData(data: any, uuid: any, titleEn: any, titleFr: any) {
      var lines = data.split(/\r\n|\n/);

      for (var j = 1; j < lines.length; j++) {
        var values = lines[j].split(","); // Split up the comma seperated values
        //This maps the specific colums from the csv into its own arrays
        uuid.push(values[0]); 
        titleEn.push(values[1]);
        titleFr.push(values[2]);
      }
      return lines.length;
    }
  }

  //contains generation of UUID to map out to aia-metadata-info.json
  generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      var r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  startAgain() {
    this.Survey.clear(true, true);
    window.localStorage.clear();
    this.$store.commit("resetSurvey");
    this.$router.push({ path: "/" });
  }
  fileLoaded($event: SurveyFile) {
    this.Survey.data = $event.data;
    this.Survey.currentPageNo = $event.currentPage;
    this.Survey.start();
    this.$store.commit("updateResult", this.Survey);

    this.myResults = this.$store.getters.resultDataSections;
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
