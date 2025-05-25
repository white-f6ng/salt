import { AfterViewInit, Component, computed, effect, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ApiService } from 'src/app/services/apiservice.service';
import { IonInput, IonButton, IonList, IonLabel, IonItem, IonRadio, IonRadioGroup, IonCheckbox } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { getlocalStorageData, setlocalStorageData } from 'src/app/core/helpers/utility';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  imports: [IonCheckbox, IonRadioGroup, IonButton, IonInput, FormsModule, IonList, IonLabel, IonItem, IonRadio]
})
export class DetailsComponent implements OnInit, AfterViewInit {


  //#region Variables

  questionnaire: { [key: string]: string } = {};
  controls: { name: string; label: string, type: string, options?: any }[] = [];
  userDetails: any = {};
  allJobDetails: any = [];
  canDetailsShow: boolean = false;
  @ViewChildren('ioninput') ioninput!: QueryList<IonInput>;
  @ViewChildren('ionRadioInput') ionRadioInput!: QueryList<IonInput>;
  @ViewChildren('ionCheckboxInput') ionCheckboxInput!: QueryList<IonCheckbox>;
  options: any = [];
  resultDetails: any = [];
  canProcess: boolean = false;
  private isProcessing = false;


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
    this.applyJobs();
  }

  chatResponse() {
    // this.apiService.questionnaireIn$.subscribe(async result => {
    //   if (result) {
    //     if (this.isProcessing || !result) return;

    //     this.isProcessing = true;
    //     this.resultDetails = result;
    //     let question = result?.chatbotResponse?.speechResponse.filter((x: any) => x.response);
    //     let questionnaire = result.jobs.find((x: any) => x.questionnaire).questionnaire;

    //     let matchedQuestion = questionnaire
    //       .find((q: any) => question.some((resp: any) => resp.response === q.questionName))
    //     if (matchedQuestion) {

    //       let key = matchedQuestion?.questionName.replace(/[\s/()?]+/g, "");
    //       let storedData = (await getlocalStorageData(key)).value;
    //       if (storedData != null) {
    //         if (this.canProcess) {
    //           this.apiService.replyChatBotResponse(result?.chatbotResponse, storedData);
    //         }
    //       } else {

    //         let options;
    //         if (["List Menu", "Radio Button", "Check Box"].includes(matchedQuestion.questionType)) {
    //           options = result?.chatbotResponse?.options;
    //         }

    //         if (!this.controls.some(x => x.name == key)) {
    //           this.controls.push({ name: key, label: matchedQuestion?.questionName, type: matchedQuestion.questionType, options: options });
    //         }
    //         this.canDetailsShow = true;
    //       }

    //     }
    //     this.isProcessing = false;

    //   }
    // })
    // this.apiService.questionnaireIn$.subscribe(result => {
    //   if (!result || this.isProcessing) return;
    //   this.isProcessing = true;

    //   const question = result?.chatbotResponse?.speechResponse.filter((x: any) => x.response);
    //   const questionnaire = result.jobs.find((x: any) => x.questionnaire)?.questionnaire;

    //   const matchedQuestion = questionnaire?.find((q: any) =>
    //     question?.some((resp: any) => resp.response === q.questionName)
    //   );

    //   if (matchedQuestion) {
    //     const key = matchedQuestion.questionName.replace(/[\s/()?]+/g, "");

    //     this.getUserDetails(key).then(storedData => {
    //       if (storedData != null && this.canProcess) {
    //         this.apiService.replyChatBotResponse(result?.chatbotResponse, storedData);
    //       } else {
    //         let options;
    //         if (["Radio Button", "List Menu"].includes(matchedQuestion.questionType)) {
    //           options = result?.chatbotResponse?.options;
    //         }

    //         if (!this.controls.some(x => x.name === key)) {
    //           this.controls.push({
    //             name: key,
    //             label: matchedQuestion.questionName,
    //             type: matchedQuestion.questionType,
    //             options
    //           });
    //         }

    //         this.canDetailsShow = true;
    //       }

    //       this.isProcessing = false;
    //     }).catch(err => {
    //       console.error('Error getting user details:', err);
    //       this.isProcessing = false;
    //     });
    //   } else {
    //     this.isProcessing = false;
    //   }
    // });
  }

  questionnaireResponse() {
    // this.apiService.chatResponseIn$.subscribe(async result => {
    //   if (result) {
    //     this.resultDetails.chatbotResponse.speechResponse = result.speechResponse;
    //     this.apiService.questionnaireInSubject.next(this.resultDetails);
    //     this.resultDetails.testObj['applyData'] = result.applyData;
    //     this.apiService.successResponse(this.resultDetails);
    //     // if (result?.actionType?.length >= 2) {
    //     // } else {
    //     // }
    //   }
    // });
  }

  question = computed(() => this.apiService.chatQuest$());

  setUserDetails(key: string, value: string) {
    setlocalStorageData(key, value);
  }

  getUserDetails(key: string) {
    return Preferences.get({ key }).then(result => result.value);
  }

  onSubmit() {
    let allInputs = [...this.ioninput.toArray(), ...this.ionRadioInput.toArray()];
    for (const input of allInputs) {
      const value = input.value as any;
      if (value) {
        
        this.setUserDetails(input.name, value);
        this.controls = this.controls.filter(x => x.name !== input.name);
      }
    }
  }

  applyJobs() {
    this.apiService.questionnaireIn$.subscribe(async result => {
      if (result) {
        let questionnaire = result?.jobs.find((x: any) => x.questionnaire).questionnaire;
        const jobId = result.jobs[0].jobId;
        this.resultDetails = result;
        let applyData: any;
        applyData = applyData || {};
        applyData[jobId] = applyData[jobId] || {};
        applyData[jobId]["answers"] = {};

        for (const [index, key] of questionnaire.entries()) {
          let keyValue = key.questionName.replace(/[\s/()?]+/g, "");
          let storedData = await getlocalStorageData(keyValue);
          if (key.questionType === "acceptance") {
            storedData.value = JSON.stringify(["Yes"]);
          }
          if (storedData.value != null) {
            let isAllowed = ["Text Box", "date"].some(x => x === key.questionType)
            if (!isAllowed) {
              storedData.value = JSON.stringify([storedData.value]);
            }
            applyData[jobId]["answers"][key.questionId] = (!isAllowed) ? JSON.parse(storedData.value) : storedData.value;

            if (index == questionnaire.length - 1) {
              this.resultDetails.testObj['applyData'] = applyData;
              this.apiService.successResponse(this.resultDetails);
            }

          } else {
            let options;
            if (["List Menu", "Radio Button", "Check Box"].some(x => x === key.questionType)) {
              options = Object.entries(key.answerOption).map(([key, value]) => ({
                key,
                value
              }));
            }

            if (!this.controls.some(x => x.name == keyValue)) {
              this.controls.push({ name: keyValue, label: key?.questionName, type: key.questionType, options: options });
            }
          }
        }
      }
    })
  }

}
