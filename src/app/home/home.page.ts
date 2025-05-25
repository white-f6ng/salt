import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonLabel, IonIcon, IonText } from '@ionic/angular/standalone';
import { ApiService } from '../services/apiservice.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Preferences } from '@capacitor/preferences';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { addIcons } from 'ionicons';
import { checkmarkCircle, closeCircle } from 'ionicons/icons';





@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonIcon, IonButton, IonItem, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, CommonModule, IonIcon, IonText, ReactiveFormsModule],
})
export class HomePage implements OnInit, AfterViewInit {
  response: any;
  inputDetails: { username: string | number, password: string | number } = { username: '', password: '' };
  @ViewChild('ionUsername') ionUsername!: IonInput;
  @ViewChild('ionPassword') ionPassword!: IonInput;
  showMessage: boolean = false;
  messageContent: string = "";
  loginForm!: FormGroup;

  constructor(private apiService: ApiService, private router: Router, private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    addIcons({ checkmarkCircle, closeCircle });
  }

  ngOnInit(): void {
    this.messageContent = "";
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
    this.cdr.detectChanges();
  }

  ngAfterViewInit(): void {
    if (!this.apiService.isLoggingOut) {
      this.getCredentialsAndLogin();
    }
    this.apiService.isLoggingOut = false
  }

  private async getCredentialsAndLogin() {
    const credentials = await this.getCredentials();

    if (credentials?.username && credentials?.password) {
      this.ionUsername.value = credentials.username;
      this.ionPassword.value = credentials.password;
      this.login();
    }
  }

  get username() {
    return this.loginForm.get('username')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  async login() {
    const credentials = {
      username: this.ionUsername.value ?? '',
      password: this.ionPassword.value ?? ''
    };
    this.setCredentials();

    await this.apiService.login(credentials)
    if (this.apiService.token) {
      if (!this.apiService.isLoggingOut) {
        this.messageContent = "Login successful. Redirecting...";
        setTimeout(() => {
          this.messageContent = "";
          this.router.navigate(['/layout']);
        }, 500);
      }
    } else {
      this.messageContent = "Login failed. Please check your credentials.";
      setTimeout(() => {
        this.messageContent = "";
      }, 2000);
    }

  }

  setCredentials = async () => {
    await Preferences.set({
      key: 'username',
      value: this.ionUsername.value as string,
    });

    await Preferences.set({
      key: 'password',
      value: this.ionPassword.value as string,
    });
  };

  getCredentials = async () => {
    const { value: username } = await Preferences.get({ key: 'username' });
    const { value: password } = await Preferences.get({ key: 'password' });

    return { username, password };
  };

  removeName = async () => {
    await Preferences.remove({ key: 'name' });
  };

}
