import { AfterViewInit, Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { IonItem, IonLabel, IonHeader, IonContent, IonTitle, IonToolbar, IonList, IonIcon, IonFab, IonFabButton, IonInput, IonButton } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { create, pencil, trash, trashBin, trashSharp, arrowUndo } from 'ionicons/icons';
import { getLocalStorageData, removeLocalStorageData, setlocalStorageData } from 'src/app/core/helpers/utility';

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
    // await Preferences.clear();
    const { keys } = await Preferences.keys();
    this.keys = keys;

    for (const key of keys) {
      let locStorage = await getLocalStorageData(key);;
      let value = locStorage?.value;
      let type = locStorage?.type ?? "Text box";

      try {
        this.LSDataSource[key] = { type: type || "", value: value };
      } catch {
        this.LSDataSource[key] = { type: type || "", value };
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
        value = JSON.stringify([value]);
        setlocalStorageData(input.name, value, matchedObj?.type);
      }
    }
  }
  clearPreference(data: any) {
    removeLocalStorageData(data);

    this.keys = this.keys.filter(key => key !== data);
  }
}
