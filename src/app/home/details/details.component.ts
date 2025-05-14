import { AfterViewInit, Component, computed, effect, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ApiService } from 'src/app/services/apiservice.service';
import { IonInput, IonButton } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { getlocalStorageData, setlocalStorageData } from 'src/app/core/helpers/utility';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  imports: [IonButton, IonInput, FormsModule]
})
export class DetailsComponent implements OnInit, AfterViewInit {


  //#region Variables

  questionnaire: { [key: string]: string } = {};
  controls: { name: string; label: string, type: string }[] = [];
  userDetails: any = {};
  allJobDetails: any = [];
  canDetailsShow: boolean = false;
  @ViewChildren('ioninput') ioninput!: QueryList<IonInput>;
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
        this.allJobDetails.public(result);
        let keys = result?.questionName.replace(/[\s/()?]+/g, "")
        let storedData = this.getUserDetails(keys) as any;

        if (storedData != null) {
          this.apiService.replyChatBotResponse(result, storedData);
        } else {
          this.controls.push({ name: keys, label: result?.questionName, type: "text" });
          this.canDetailsShow = true;
        }
      }
    });
  }

  question = computed(() => this.apiService.chatQuest$());

  assignDefault() {
    let data = [
      { name: "FirstName", label: "First Name", type: "text" },
      { name: "LastName", label: "Last Name", type: "text" },
      { name: "CGPAPercentagelastEdu", label: "CGPA Percentage last Edu", type: "text" },
      { name: "CurrentCompany", label: "Current Company", type: "text" },
      { name: "WhatisyourcurrentCTCinLakhsperannum", label: "What is your current CTC in Lakhs per annum", type: "text" },
      { name: "WhatisyourexpectedCTCinLakhsperannum", label: "What is your expected CTC in Lakhs per annum", type: "text" }
    ];

    this.controls.push(...data);
  }

  setUserDetails(key: string, value: string) {
    setlocalStorageData(key, value);
  }

  getUserDetails(key: string) {
    return getlocalStorageData(key)
  }


  onSubmit() {
    let dataSource = this.ioninput.toArray();

    for (let i = 0; i < dataSource.length; i++) {
      let value = dataSource[i].value as any;
      if (value) {
        this.setUserDetails(dataSource[i].name, value);
      }
      this.apiService.replyChatBotResponse(this.allJobDetails, value);
    }
    this.canDetailsShow = false;
  }


}
