import { AfterViewInit, Component, computed, effect, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/apiservice.service';
import { IonInput } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  imports: [IonInput, FormsModule]
})
export class DetailsComponent implements OnInit, AfterViewInit {


  //#region Variables

  questionnaire: { [key: string]: string } = {};
  controls: { name: string; label: string, type: string }[] = [];
  userDetails: any = {}

  //#endregion Variables

  constructor(private apiService: ApiService) {
    this.questionnaire = {
      FirstName: "",
      LastName: "",
      CGPAPercentagelastEdu: "",
      CurrentCompany: "",
      WhatisyourcurrentCTCinLakhsperannum: "",
      WhatisyourexpectedCTCinLakhsperannum: "",
      HowmanyyearsofexperiencedoyouhaveinAngularFramework: "",
      HowmanyyearsofexperiencedoyouhaveinHtmlCss: "",
      Whatisyournoticeperiod: "",
    }
    effect(() => {
      const msg = this.question();
      if (msg) {
        console.log("Component B got message:", msg);
      }
    });
  }

  ngOnInit() {
    this.questionnaireResponse();
  }

  ngAfterViewInit(): void {
    this.chatResponse();
    this.assignDefault();
  }

  chatResponse() {
    this.apiService.chatResponseIn$.subscribe(result => {
      if (result) {
        console.log("Chat response: ", result);
      }
    })
  }

  questionnaireResponse() {
    this.apiService.questionnaireIn$.subscribe(result => {
      if (result) {
        this.questionnaire[result?.questionName.replace(/[\s/()?]+/g, "")];
        this.controls.concat({ name: result?.questionName.replace(/[\s/()?]+/g, ""), label: result?.questionName, type: "text" });
      }
    })
  }

  question = computed(() => this.apiService.chatQuest$());

  assignDefault() {
    this.controls.push({ name: "FirstName", label: "First Name", type: "text" });
    this.controls.push({ name: "LastName", label: "Last Name", type: "text" });
    this.controls.push({ name: "CGPAPercentagelastEdu", label: "CGPA Percentage last Edu", type: "text" });
    this.controls.push({ name: "CurrentCompany", label: "Current Company", type: "text" });
    this.controls.push({ name: "WhatisyourcurrentCTCinLakhsperannum", label: "What is your current CTC in Lakhs per annum", type: "text" });
    this.controls.push({ name: "WhatisyourexpectedCTCinLakhsperannum", label: "What is your expected CTC in Lakhs per annum", type: "text" });
  }

}
