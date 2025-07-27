import { AfterViewInit, ChangeDetectorRef, Component, computed, effect, OnInit, ViewChild } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonLabel, IonIcon, IonText } from '@ionic/angular/standalone';
import { ApiService } from '../services/apiservice.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Preferences } from '@capacitor/preferences';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { addIcons } from 'ionicons';
import { checkmarkCircle, closeCircle } from 'ionicons/icons';
import { getLocalStorageData, setlocalStorageData } from '../core/helpers/utility';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonIcon, IonButton, IonItem, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, CommonModule, IonIcon, IonText, ReactiveFormsModule],
})
export class HomePage implements OnInit, AfterViewInit {
  response: any;
  @ViewChild('ionUsername') ionUsername!: IonInput;
  @ViewChild('ionPassword') ionPassword!: IonInput;
  showMessage: boolean = false;
  messageContent: string = "";
  loginForm!: FormGroup;

  constructor(private apiService: ApiService, private router: Router, private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    addIcons({ checkmarkCircle, closeCircle });
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
    if (!this.apiService.isLoggingOut) {
      this.getCredentialsAndLogin();
    }
    this.apiService.isLoggingOut = false
    this.messageContent = "";
  }

  ngAfterViewInit(): void {

  }

  private async getCredentialsAndLogin() {
    const credentials = await this.getCredentials();

    if (credentials?.username && credentials?.password) {
      this.ionUsername.value = credentials.username;
      this.ionPassword.value = credentials.password;
      this.login(true);
      this.loginForm.patchValue(credentials);
    }
  }

  get username() {
    return this.loginForm.get('username')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  async login(canAllow: boolean = false): Promise<void> {
    const credentials = {
      username: this.ionUsername.value || '',
      password: this.ionPassword.value || ''
    };

    this.setCredentials();

    await this.apiService.login(credentials);

    if (!this.apiService.token) {
      this.messageContent = "Login failed. Please check your credentials.";
      setTimeout(() => this.messageContent = "", 1000);
      return;
    }

    if (this.apiService.isLoggingOut) return;

    this.messageContent = canAllow ? "" : "Login successful. Redirecting...";

    const navigate = () => {
      this.messageContent = "";
      this.router.navigate(['/layout']);
    };

    canAllow ? navigate() : setTimeout(navigate, 500);
  }


  setCredentials = async () => {
    setlocalStorageData('username', this.ionUsername.value as string, 'text',null);
    setlocalStorageData('password', this.ionPassword.value as string, 'text',null);

  };

  getCredentials = async () => {
    const { value: username } = await getLocalStorageData('username');
    const { value: password } = await getLocalStorageData('password');

    return { username, password };
  };

  removeName = async () => {
    await Preferences.remove({ key: 'name' });
  };


}
