import { AfterViewInit, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonInput, IonItem, IonLabel, IonList, IonSearchbar, IonSelect, IonSelectOption, IonTab, IonTabBar, IonTabButton, IonTabs, IonToast } from "@ionic/angular/standalone";
import { ApiService } from 'src/app/services/apiservice.service';
import { Platform, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logOutOutline, playCircle, search, downloadOutline, clipboardOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { Preferences } from '@capacitor/preferences';
import { Clipboard } from '@capacitor/clipboard';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode/ngx';
import { DetailsComponent } from '../details/details.component';
import { getlocalStorageData, setlocalStorageData } from 'src/app/core/helpers/utility';
import { FormsModule } from '@angular/forms';



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
  bodyData = {
    profile: {
      summary:
        "Passionate Angular developer with 2.5 years of experience in creating dynamic, responsive web applications. Proficient in Angular, JavaScript, TypeScript, HTML, and CSS, with a solid understanding of front-end development and UX/UI best practices. Additionally, have basic knowledge of MVC architecture using C# .Net, allowing for effective collaboration in full-stack environments. Adept at building scalable, high-performance solutions and working closely with cross-functional teams to meet project goals. Eager to expand my skills and contribute to innovative development projects",
    },
    profileId: "5d1d9111d83e31fd4c4c5af2761a478a57e6da4935a9e7c2fcc93b141dd0abb8",
  };

  userDetails: any = {
    experience: "",
    prefLocation: "",
    PreferedTitle: "",
  }

  public results: any = [];

  constructor(public apiService: ApiService, private router: Router, private platform: Platform,
    private toastController: ToastController,
    private backgroundMode: BackgroundMode,
  ) {
    addIcons({ logOutOutline, playCircle, search, downloadOutline, clipboardOutline, checkmarkCircleOutline });

  }

  ngOnInit() {
    this.showMessage = false;
    this.results = [];
    this.selectedValue = '';
  }

  ngAfterViewInit(): void {
    this.getLocalStorage();
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
    let isfirst = 0;
    await this.apiService.getDashboardData()
    let timeInterval = Number(this.ionMinutes.value) * 1000;
    setInterval(() => {
      let profile = this.apiService.dashboardOutResult.profile[0];
      if (!isfirst) {
        profile.summary = this.bodyData.profile.summary.concat(this.ionProfileUpdate?.value as string);
        isfirst = 1;
      } else {
        profile.summary = this.bodyData.profile.summary.split(this.ionProfileUpdate?.value as string)[0];
        isfirst = 0;
      }
      this.processData();
    }, timeInterval);
  }

  async processData() {

    let { profile, profileId } = this.apiService.dashboardOutResult

    await this.apiService.beginProcess(this.apiService.dashboardOutResult);
  }

  submitSearch() {
    let preferedTitle: string[] = [];

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
      }, 3000);
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
        this.presentToast();
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

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Copied to Clipboard',
      duration: 1000,
      position: 'bottom',
      icon: 'clipboard-outline'
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
        await setlocalStorageData(nameAttr, value);
      }
    }
  }

  getLocalStorage = async () => {
    for (const key of Object.keys(this.userDetails)) {
      const result = await getlocalStorageData(key);
      if (result !== null) {
        this.userDetails[key] = result;
      }
    }
  }

  openJobDetail(job: any) {
    if (job) {
      this.apiService.applyChatResponse(job);
    }

  }
}