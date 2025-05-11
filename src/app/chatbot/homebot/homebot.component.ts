import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonSelectOption, IonTitle, IonList, IonPopover, IonItem, IonInput, IonButton, IonLabel, IonIcon, IonText, IonSelect, IonSearchbar, IonContent } from '@ionic/angular/standalone';
import { PopoverController } from '@ionic/angular';
import { ApiService } from 'src/app/services/apiservice.service';

@Component({
  selector: 'app-homebot',
  templateUrl: './homebot.component.html',
  styleUrls: ['./homebot.component.scss'],
  imports: [IonContent, IonSearchbar, CommonModule, FormsModule, IonItem, IonPopover, IonList, IonSearchbar, IonLabel, IonSelect, IonSelectOption,IonButton],
  providers: [PopoverController]
})
export class HomebotComponent implements OnInit {

  userInput: string = '';
  messages: { sender: string, text: string, key: number, type?: string }[] = [];
  currentStep = 0;
  iterationCount = 0;
  userData: any = {};
  isMenuEnable = false;
  public results: any[] = [];
  selectedValue: String = "";
  questions = [
    { type: 'greetings', question: 'What would you like to do today?' },
  ];
  @ViewChild('elementRef') elementRef: any;
  @ViewChild('menuPopover') menuPopover: any;
  @ViewChild('searchBar') searchBar!: IonSearchbar;

  constructor(private apiService: ApiService) {
    this.askNextQuestion();
  }
  ngOnInit(): void {

  }

  sendMessage() {
    const input = this.userInput.trim();
    if (!input) return;
    this.iterationCount = this.elementRef?.nativeElement?.dataset?.iterationCount
    this.messages.push({ sender: 'user', text: input, key: this.iterationCount });

    const currentKey = this.questions[this.currentStep].type;
    this.userData[currentKey] = input;

    this.userInput = '';
    this.currentStep++;

    if (this.currentStep < this.questions.length) {
      this.askNextQuestion();
    }
  }

  askNextQuestion() {
    const question = this.questions[this.currentStep];
    this.messages.push({ sender: 'bot', text: question.question, key: this.currentStep });

  }

  // Menu item methods
  updateProfile(popover: any) {
    this.questions.push({ type: 'bot1', question: 'Great You have Selected Profile Update, Please complete the Following Steps' });
    popover.dismiss();
    this.messages.push({ sender: 'user', text: "Profile Update", key: this.iterationCount });
    this.iterationCount = this.elementRef?.nativeElement?.dataset?.iterationCount;
    this.nextQuestion();
  }

  nextQuestion() {
    this.currentStep++;
    this.askNextQuestion();
  }

  setQuestionsJobSearch() {
    this.questions.push({ type: 'experience', question: 'How many years of experience do you have?' });
    this.questions.push({ type: 'experience', question: 'Please enter your desired job location. If you are okay with any location, enter "NA".' });
    this.questions.push({ type: 'experience', question: 'What is your preferred job posting time frame?' });
    this.iterationCount = this.elementRef?.nativeElement?.dataset?.iterationCount;
  }


  searchJob(popover: any) {

    this.questions.push({ type: 'bot1', question: 'Great You have Selected Job Search, Please complete the Following Steps', });

    this.messages.push({ sender: 'user', text: "Job Search", key: this.iterationCount });
    this.iterationCount = this.elementRef?.nativeElement?.dataset?.iterationCount;
    this.nextQuestion();

    setTimeout(() => {
      this.questions.push({ type: 'skill', question: 'Please enter the skills' });
      this.nextQuestion();
      this.setQuestionsJobSearch();
    }, 500);

    popover.dismiss();
    this.iterationCount = this.elementRef?.nativeElement?.dataset?.iterationCount;
  }

  async handleInput(event: Event) {
    this.results = [];
    this.selectedValue = '';
    const target = event.target as HTMLIonSearchbarElement;
    const query = target.value?.toLowerCase() || '';
    this.results = await this.apiService.getLovData(query);
  }

  selectResult(data: string) {
    const encodedValue = encodeURIComponent(data.toLocaleLowerCase());
    this.selectedValue = encodedValue;
    this.searchBar.value = data;
    this.messages.push({ sender: 'user', text: data, key: this.iterationCount });
    this.nextQuestion();
  }

}
