import { AfterViewInit, Component, computed, effect, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ApiService } from 'src/app/services/apiservice.service';
import { IonInput, IonButton, IonList, IonLabel, IonItem, IonRadio, IonRadioGroup } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { getlocalStorageData, setlocalStorageData } from 'src/app/core/helpers/utility';
import { Preferences } from '@capacitor/preferences';

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
  @ViewChildren('ionRadioInput') ionRadioInput!: QueryList<IonInput>;
  options: any = [];
  resultDetails: any = [];
  applyData: any = {};
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
    this.chatResponse();
  }

  chatResponse() {
    // this.apiService.questionnaireIn$.subscribe(result => {
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
    //       let storedData = this.getUserDetails(key);
    //       if (storedData != null) {
    //         if (this.canProcess) {
    //           this.apiService.replyChatBotResponse(result?.chatbotResponse, storedData);
    //         }
    //       } else {

    //         let options;
    //         if (matchedQuestion.questionType === "Radio Button" || matchedQuestion.questionType === "List Menu") {
    //           options = result?.chatbotResponse?.options;
    //         }

    //         if (!this.controls.some(x => x.name == key)) {
    //           this.controls.push({ name: key, label: matchedQuestion?.questionName, type: matchedQuestion.questionType, options: options });
    //         }
    //         this.canDetailsShow = true;
    //       }

    //     }

    //   }
    // })
    this.apiService.questionnaireIn$.subscribe(result => {
      if (!result || this.isProcessing) return;
      this.isProcessing = true;

      const question = result?.chatbotResponse?.speechResponse.filter((x: any) => x.response);
      const questionnaire = result.jobs.find((x: any) => x.questionnaire)?.questionnaire;

      const matchedQuestion = questionnaire?.find((q: any) =>
        question?.some((resp: any) => resp.response === q.questionName)
      );

      if (matchedQuestion) {
        const key = matchedQuestion.questionName.replace(/[\s/()?]+/g, "");

        this.getUserDetails(key).then(storedData => {
          if (storedData != null && this.canProcess) {
            this.apiService.replyChatBotResponse(result?.chatbotResponse, storedData);
          } else {
            let options;
            if (["Radio Button", "List Menu"].includes(matchedQuestion.questionType)) {
              options = result?.chatbotResponse?.options;
            }

            if (!this.controls.some(x => x.name === key)) {
              this.controls.push({
                name: key,
                label: matchedQuestion.questionName,
                type: matchedQuestion.questionType,
                options
              });
            }

            this.canDetailsShow = true;
          }

          this.isProcessing = false;
        }).catch(err => {
          console.error('Error getting user details:', err);
          this.isProcessing = false;
        });
      } else {
        this.isProcessing = false;
      }
    });
  }

  questionnaireResponse() {
    this.apiService.chatResponseIn$.subscribe(async result => {
      if (result) {
        if (!result?.actionType?.length) {
          this.resultDetails.chatbotResponse.speechResponse = result.speechResponse;
          this.apiService.questionnaireInSubject.next(this.resultDetails);
        } else {
          this.resultDetails.testObj['applyData'] = result.applyData;
          this.apiService.successResponse(this.resultDetails);
        }
      }
    });
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


}
