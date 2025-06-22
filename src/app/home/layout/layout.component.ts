import { AfterViewInit, Component, computed, effect, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonInput, IonItem, IonLabel, IonList, IonSearchbar, IonSelect, IonSelectOption, IonTab, IonTabBar, IonTabButton, IonTabs, IonToast, IonTitle, IonToolbar, IonHeader } from "@ionic/angular/standalone";
import { ApiService } from 'src/app/services/apiservice.service';
import { Platform, ToastController,AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logOutOutline, playCircle, search, downloadOutline, clipboardOutline, checkmarkCircleOutline, fileTray } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { Preferences } from '@capacitor/preferences';
import { Clipboard } from '@capacitor/clipboard';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode/ngx';
import { DetailsComponent } from '../details/details.component';
import { getLocalStorageData, setlocalStorageData } from 'src/app/core/helpers/utility';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';



@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  imports: [IonLabel, IonIcon, IonTab, IonTabBar, IonTabButton, CommonModule, IonTabs, IonInput, IonButton, IonContent, IonItem, IonLabel, IonSelect, IonSelectOption, IonSearchbar, IonList, DetailsComponent, FormsModule],
  providers: [BackgroundMode]
})
export class LayoutComponent implements OnInit, AfterViewInit {

  searchData: any = {};
  @ViewChild('searchBar') searchBar!: IonSearchbar;
  @ViewChild('ionMinutes') ionMinutes!: IonInput;
  @ViewChild('ionProfileUpdate') ionProfileUpdate!: IonInput;
  @ViewChild('preLocation') preLocation!: IonInput;
  @ViewChild('selectRef') selectRef!: IonSelect;
  @ViewChild('detialComponentRef') detialComponentRef!: DetailsComponent;
  @ViewChildren(IonInput) ionInputs!: QueryList<IonInput>;

  showMessage: boolean = false;
  messageContent: string = "";
  buttonMsg: string = "Submit";
  selectedValue: String = "";
  userDetails: any = {
    Experience: "",
    prefLocation: "",
    PreferedTitle: "",
  }

  public results: any = [];

  private timer$: Subscription | null = null;
  time = 0;
  btnMsg = "Process";
  jobDeatils: any;


  constructor(public apiService: ApiService, private router: Router, private platform: Platform,
    private toastController: ToastController,
    private alertController: AlertController,
    private backgroundMode: BackgroundMode) {
    addIcons({ logOutOutline, playCircle, search, downloadOutline, clipboardOutline, checkmarkCircleOutline, fileTray });
    effect(() => {
      let count = this.startTimer();
      if (count) {
        this.start();
      }
      let session = this.sessionExpired();
      if (session) {
        this.messageContent = "";
        this.router.navigate(['']);
      }
      let isValid = this.isValid(); {
        if (isValid) {
          this.presentValidationAlert(isValid);
        }
      }
    });
  }

  ngOnInit() {
    this.showMessage = false;
    this.results = [];
    this.selectedValue = '';
  }

  ngAfterViewInit(): void {
    this.getLocalStorage();
    this.loadPreferences();
  }

  startBackgroundTask() {
    this.platform.ready().then(() => {
      console.log('🚀 Platform ready — plugins safe to use');

      this.backgroundMode.enable();

      this.backgroundMode.setDefaults({
        title: 'App in Background',
        text: 'Still working behind the scenes',
        silent: false,
      });

      this.backgroundMode.on('activate').subscribe(() => {
        console.log('✅ Background mode activated');
        this.beginTheProcess();
      });

      this.backgroundMode.on('deactivate').subscribe(() => {
        console.log('❌ Background mode deactivated');
      });
    });

  }

  async beginTheProcess() {
    if (this.apiService.token) {
      await this.apiService.getDashboardData();
      this.processData();
      this.setLocalsotrageData();
    } else {
      this.showMessage = true;
      this.messageContent = "Your token has been expired, Please login to use this feature."
      setTimeout(() => {
        this.messageContent = "";
        this.router.navigate([""]);
      }, 1000);
    }
  }

  start() {
    this.time = Number(this.ionMinutes.value) * 60 * 1000;
    if (!this.timer$ && this.time > 0) {
      this.timer$ = interval(1000).subscribe(() => {
        if (this.time > 0) {
          this.time -= 1000;
        }
      });
    }
  }

  startTimer = computed(() => this.apiService.chatQuest$());
  sessionExpired = computed(() => this.apiService.tokenExpired$());
  isValid = computed(() => this.apiService.validation$());

  async processData() {
    if (this.btnMsg === "Process") {
      this.btnMsg = "Cancel";
      let { profile } = this.apiService.dashboardOutResult;
      let timeInterval = Number(this.ionMinutes.value) * 60 * 1000;
      this.start();
      let data = {};
      data = {
        profile: {
          summary: profile[0].summary,
        },
        profileId: profile[0].profileId,
      }

      await this.apiService.beginProcess(data, this.ionProfileUpdate?.value as string, timeInterval);
    } else {
      clearInterval(this.apiService.intervalRef);
      this.btnMsg = "Process";
      this.time = 0;
    }
  }

  submitSearch() {
    let preferedTitle: string[] = [];
    this.getAllPreferences();
    if (typeof this.userDetails.PreferedTitle === 'string') {
      preferedTitle = this.userDetails.PreferedTitle.split(',');
    } else {
      preferedTitle = [];
    }

    if (this.buttonMsg === "Cancel") {
      this.apiService.canProceed = false;
      this.buttonMsg = "Submit";
    } else if (this.apiService.token) {
      this.searchData = {
        skills: this.selectedValue,
        experience: this.userDetails.experience,
        location: this.userDetails.prefLocation,
        jobAge: this.selectRef.value,
        preferedTitle: preferedTitle,
      }

      this.buttonMsg = "Cancel";
      this.apiService.errorMsg = [];
      this.apiService.canProceed = true;
      this.apiService.searchJobs(this.searchData)
      this.setlocalStorage();
    } else {
      this.showMessage = true;
      this.messageContent = "Your token has been expired, Please login to use this feature."
      setTimeout(() => {
        this.messageContent = "";
        this.router.navigate([""]);
      }, 1000);
    }
  }

  logout() {
    this.apiService.isLoggingOut = true;
    this.router.navigate([""]);
  }

  selectResult(data: string) {
    const encodedValue = encodeURIComponent(data.toLocaleLowerCase());
    this.selectedValue = encodedValue;
    this.searchBar.value = data;
  }

  exportToExcel() {
    this.apiService.exportToExcel();
  }

  async handleInput(event: Event) {
    this.results = [];
    this.selectedValue = '';
    const target = event.target as HTMLIonSearchbarElement;
    const query = target.value?.toLowerCase() || '';
    this.results = await this.apiService.getLovData(query);
  }

  async copyText(text: string) {
    if (this.platform.is('capacitor')) {
      try {
        await Clipboard.write({ string: text });
        this.presentToast('Copied to clipboard', 'success', 'checkmarkCircleOutline');
      } catch (err) {
        console.error('Failed to copy using Capacitor Clipboard:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        console.log('Copied using Web Clipboard API');
      } catch (err) {
        console.error('Failed to copy using Web Clipboard API:', err);
      }
    }
  }

  async presentToast(message: string, color: string, icon: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 1000,
      position: 'bottom',
      icon: icon,
      color: color
    });
    await toast.present();
  }

  async replyChatBotResponse(cr: any, text: string) {
    let response = await this.apiService.replyChatBotResponse(cr, text);
    let speechResponse = response?.data?.speechResponse;
    if (speechResponse?.length) {
      this.router.navigate(['/details']);
    }
  }

  setlocalStorage = async () => {
    for (const input of this.ionInputs.toArray()) {
      const nameAttr = (await input.getInputElement()).name;
      const value = await input.getInputElement().then(el => el.value);
      if (nameAttr && value) {
        await setlocalStorageData(nameAttr, value, "text");
      }
    }
    if (this?.searchBar?.value) {
      await setlocalStorageData('SearchBar', this?.searchBar?.value, "text");
    }
    if (this?.selectRef?.value) {
      await setlocalStorageData('JobAge', this?.selectRef?.value, "text");
    }
  }

  getLocalStorage = async () => {
    for (const key of Object.keys(this.userDetails)) {
      const result = (await getLocalStorageData(key));
      if (result.value !== null) {
        this.userDetails[key] = result.value;
      }
    }
    let searchBar = (await getLocalStorageData('SearchBar'));
    if (searchBar.value) {
      this.searchBar.value = searchBar.value;
      this.selectResult(searchBar.value!);
    }
    let jobAge = (await getLocalStorageData('JobAge'));
    if (jobAge.value !== null) {
      this.selectRef.value = jobAge.value;
    }
  }

  async openJobDetail(job: any) {
    if (job) {
      this.jobDeatils = job;
      this.detialComponentRef.canProcess = true;
      await this.apiService.applyChatResponse(job);
    }
  }

  async clearChatRes() {
    for (const key of this.apiService.chatResponseJobDetails) {
      await this.apiService.applyChatResponse(key);
    }
  }

  async getAllPreferences() {
    const { keys } = await Preferences.keys();
    const all: { [key: string]: any } = {};
    for (const key of keys) {
      const { value } = await Preferences.get({ key });
      try {
        all[key] = JSON.parse(value!);
      } catch {
        all[key] = value;
      }
    }
  }

  openPreference() {
    this.router.navigate(['/preferences']);
  }

  async setLocalsotrageData() {
    let localValue = [this.ionProfileUpdate, this.ionMinutes]
    for (let i = 0; i < localValue.length; i++) {
      const input = localValue[i];
      setlocalStorageData(input.name, input.value as string, "text");
    }
  }

  async loadPreferences() {
    this.ionMinutes.value = (await getLocalStorageData('ionMinute'))?.value;
    this.ionProfileUpdate.value = (await getLocalStorageData('ionProfileUpdate'))?.value;
  }

  // handleValidationMessages(validationErrors: any) {

  //   for (let i = 0; i < validationErrors.length; i++) {

  //     let questionName = this.jobDeatils?.jobs[0]?.questionnaire.find((x: any) => x.questionId ===validationErrors[i]?.field )?.questionName

  //     let message = `${questionName} : ${validationErrors[i].message}`;

  //     this.presentToast(message, 'danger', 'alert-circle');
      
  //   }

  // }
 async presentValidationAlert(validationErrors: any[]) {
  const errorMessages = validationErrors.map(err => {
    const questionName = this.jobDeatils?.jobs[0]?.questionnaire.find(
      (x: any) => x.questionId === err?.field
    )?.questionName || err?.field;

    return `${questionName}: ${err.message}\n`;
  });

  const alert = await this.alertController.create({
    header: 'Validation Errors',
    message: `${errorMessages.join('\n')}`,
    cssClass: 'error-alert',
    buttons: ['OK']
  });

  await alert.present();
}

}