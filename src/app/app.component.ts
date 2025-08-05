import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Keyboard } from '@capacitor/keyboard';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {
    Keyboard.setScroll({ isDisabled: false });
  }
}
