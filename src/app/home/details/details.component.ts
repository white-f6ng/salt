import { AfterViewInit, Component, computed, effect, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ApiService } from 'src/app/services/apiservice.service';
import { IonInput, IonButton, IonList, IonLabel, IonItem, IonRadio, IonRadioGroup } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { getlocalStorageData, setlocalStorageData } from 'src/app/core/helpers/utility';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  imports: [IonRadioGroup, IonButton, IonInput, FormsModule, IonList, IonLabel, IonItem, IonRadio]
})
export class DetailsComponent implements OnInit, AfterViewInit {


  //#region Variables

  questionnaire: { [key: string]: string } = {};
  controls: { name: string; label: string, type: string, options?: any }[] = [];
  userDetails: any = {};
  allJobDetails: any = [];
  canDetailsShow: boolean = false;
  @ViewChildren('ioninput') ioninput!: QueryList<IonInput>;
  options: any = [];
  applyData: any = {};

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
    this.apiService.questionnaireIn$.subscribe(async result => {
      if (result) {
        let question = result?.chatbotResponse?.speechResponse.filter((x: any) => x.response);
        let questionnaire = result.jobs.find((x: any) => x.questionnaire).questionnaire;

        let matchedQuestion = questionnaire
          .find((q: any) => question.some((resp: any) => resp.response === q.questionName))
        if (matchedQuestion) {

          let key = matchedQuestion?.questionName.replace(/[\s/()?]+/g, "");
          let storedData = await this.getUserDetails(key);
          if (storedData != null) {
            this.apiService.replyChatBotResponse(result?.chatbotResponse, storedData);
          } else {

            let options;
            if (matchedQuestion.questionType === "Radio Button") {
              options = result?.chatbotResponse?.options;
            }

            if (!this.controls.some(x => x.name == key)) {
              this.controls.push({ name: key, label: matchedQuestion?.questionName, type: matchedQuestion.questionType, options: options });
            }
            this.canDetailsShow = true;
          }
        }

      }
    })
  }

  questionnaireResponse() {
    // this.apiService.questionnaireIn$.subscribe(result => {
    //   if (result) {
    //     this.allJobDetails.push(result);
    //     let keys = result?.question?.questionName.replace(/[\s/()?]+/g, "")
    //     let storedData = this.getUserDetails(keys) as any;

    //     if (storedData != null) {
    //       this.apiService.replyChatBotResponse(result, storedData);
    //     } else {
    //       this.controls.push({ name: keys, label: result?.questionName, type: "text" });
    //       this.canDetailsShow = true;
    //     }
    //   }
    // });
  }



  question = computed(() => this.apiService.chatQuest$());

  assignDefault() {
    let data = [
      { name: "FirstName", label: "First Name", type: "Text Box" },
      { name: "LastName", label: "Last Name", type: "Text Box" },
      { name: "CGPAPercentagelastEdu", label: "CGPA Percentage last Edu", type: "Text Box" },
      { name: "CurrentCompany", label: "Current Company", type: "Text Box" },
      { name: "WhatisyourcurrentCTCinLakhsperannum", label: "What is your current CTC in Lakhs per annum", type: "Text Box" },
      { name: "WhatisyourexpectedCTCinLakhsperannum", label: "What is your expected CTC in Lakhs per annum", type: "Text Box" }
    ];

    this.controls.push(...data);
  }

  setUserDetails(key: string, value: string) {
    setlocalStorageData(key, value);
  }

  async getUserDetails(key: string) {
    let data = await getlocalStorageData(key);
    return data.value;
  }


  onSubmit() {
    let dataSource = this.ioninput.toArray();

    for (let i = 0; i < dataSource.length; i++) {
      let value = dataSource[i].value as any;
      if (value) {
        this.setUserDetails(dataSource[i].name, value);
        this.controls = this.controls.filter(x => x.name != dataSource[i].name);
      }
      // this.apiService.replyChatBotResponse(this.allJobDetails, value);
    }
    // this.canDetailsShow = false;
  }


}
