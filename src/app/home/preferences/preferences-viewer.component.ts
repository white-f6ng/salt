import { AfterViewInit, Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { IonItem, IonLabel, IonHeader, IonContent, IonTitle, IonToolbar, IonList, IonIcon, IonFab, IonFabButton, IonInput, IonButton } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { create, pencil, trash, trashBin, trashSharp, arrowUndo } from 'ionicons/icons';
import { getlocalStorageData, setlocalStorageData } from 'src/app/core/helpers/utility';

@Component({
  selector: 'app-preferences-viewer',
  templateUrl: './preferences-viewer.component.html',
  styleUrls: ['./preferences-viewer.component.scss'],
  imports: [IonButton, IonInput, IonIcon, IonHeader, IonItem, IonLabel, IonToolbar, IonTitle, IonContent, IonLabel, IonItem, IonList, IonIcon, IonFab, FormsModule],
})
export class PreferencesViewerComponent implements OnInit, AfterViewInit {
  keys: string[] = [];
  LSDataSource: { [key: string]: { type: string, value: any } } = {};
  @ViewChildren('IonInput') IonInput!: QueryList<IonInput>;
  constructor(private router: Router) {
    addIcons({ trashBin, trash, trashSharp, pencil, create, arrowUndo })
  }

  ngOnInit() {

  }
  ngAfterViewInit(): void {
    this.getPreferences();
  }

  async getPreferences() {
    const { keys } = await Preferences.keys();
    this.keys = keys;

    for (const key of keys) {
      const { getSotrage, splittedValue } = await getlocalStorageData(key);;
      let value = getSotrage?.value;
      try {
        this.LSDataSource[key] = { type: splittedValue!, value: JSON.parse(value!) };
      } catch {
        this.LSDataSource[key] = { type: splittedValue!, value };
      }
    }
  }
  goBack() {
    this.router.navigate(['/layout'])
  }


  onSubmit() {
    let allInputs = [...this.IonInput.toArray()];
    for (const input of allInputs) {
      let value = input.value as any;
      if (value) {
        let matchedObj = this.LSDataSource[input.name];
        value = `${value}|${matchedObj?.type}`
        value = JSON.stringify([value]);
        setlocalStorageData(input.name, value);
      }
    }

  }
}
