import { AfterViewInit, Component, computed, effect, Input, OnChanges, OnInit, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { ApiService } from 'src/app/services/apiservice.service';
import { IonInput, IonButton, IonList, IonLabel, IonItem, IonRadio, 
  IonRadioGroup, IonCheckbox } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { getLocalStorageData, setlocalStorageData } from 'src/app/core/helpers/utility';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  imports: [IonCheckbox, IonRadioGroup, IonButton, IonInput, FormsModule, IonList, IonLabel, IonItem, IonRadio]
})
export class DetailsComponent implements OnInit, AfterViewInit, OnChanges {

  //#region Variables

  controls: { name: string; label: string, type: string, options?: any }[] = [];
  userDetails: any = {};
  allJobDetails: any = [];
  canDetailsShow: boolean = false;
  @ViewChildren('ioninput') ioninput!: QueryList<IonInput>;
  @ViewChildren('ionRadioInput') ionRadioInput!: QueryList<IonRadio>;
  @ViewChildren('ionCheckboxInput') ionCheckboxInput!: QueryList<IonCheckbox>;
  options: any = [];
  resultDetails: any = [];
  canProcess: boolean = false;
  @Input('isChanged') isChanged: boolean = false;
  jobDetails: any;

  //#endregion Variables

  constructor(private apiService: ApiService) {
    
  }

  ngOnInit() {
    this.questionnaireResponse();
  }

  ngAfterViewInit(): void {
    this.applyJobs();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isChanged'] && changes['isChanged'].currentValue) {
      this.controls = [];
      this.isChanged = changes['isChanged'].currentValue;
    }
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

  setUserDetails(key: string, value: string, type: string) {
    setlocalStorageData(key, value, type);
  }

  getUserDetails(key: string) {
    return Preferences.get({ key }).then(result => result.value);
  }

  onSubmit() {
    let allInputs = [...this.ioninput.toArray(), ...this.ionRadioInput.toArray()];
    for (const input of allInputs) {
      let value = input.value as any;
      if (value) {
        let matchedObj = this.controls.find(x => x.name === input.name);
        this.setUserDetails(input.name, value, matchedObj?.type!);
        this.controls = this.controls.filter(x => x.name !== input.name);
      }
    }
    let checkBoxInputs = this.ionCheckboxInput.toArray();
    for (const checkbox of checkBoxInputs) {
      if (checkbox.checked) {
        let value = checkbox.value;
        this.setUserDetails(checkbox.name, value, "Check Box");
        this.controls = this.controls.filter(x => x.name !== checkbox.name);
      }
    }
    this.apiService.applyChatResponse(this.jobDetails);
  }

  applyJobs() {
    this.apiService.questionnaireIn$.subscribe(async result => {
      if (result) {
        this.jobDetails = result;
        let questionnaire = result?.jobs.find((x: any) => x.questionnaire).questionnaire;
        const jobId = result.jobs[0].jobId;
        this.resultDetails = result;
        let applyData: any;
        applyData = applyData || {};
        applyData[jobId] = applyData[jobId] || {};
        applyData[jobId]["answers"] = {};
        let canProceed = true;

        for (const [index, key] of questionnaire.entries()) {
          let keyValue = key.questionName.replace(/[\s/()?]+/g, "");
          let storedData = (await getLocalStorageData(keyValue));
          if (key.questionType === "acceptance") {
            storedData.value = JSON.stringify(["Yes"]);
          }
          if (storedData.value != null ) {

            const isTextBox = key.questionType === "Text Box";
            applyData[jobId]["answers"][key.questionId] = isTextBox ? storedData.value : [storedData.value];

            if (index == questionnaire.length - 1 && canProceed) {
              this.resultDetails.testObj['applyData'] = applyData;
              this.apiService.successResponse(this.resultDetails);
            }

          } else {
            let options;
            canProceed = false;
            if (["List Menu", "Radio Button", "Check Box"].some(x => x === key.questionType)) {
              options = Object.entries(key.answerOption).map(([key, value]) => ({
                key,value
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
