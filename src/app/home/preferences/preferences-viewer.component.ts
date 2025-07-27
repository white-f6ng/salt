import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, DoCheck, OnChanges, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { IonButton, IonContent, IonFab, IonIcon, IonInput, IonItem, IonLabel, IonList, IonSearchbar } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { arrowUndo, create, pencil, trash, trashBin, trashSharp } from 'ionicons/icons';
import { getLocalStorageData, removeLocalStorageData, setlocalStorageData } from 'src/app/core/helpers/utility';

@Component({
  selector: 'app-preferences-viewer',
  templateUrl: './preferences-viewer.component.html',
  styleUrls: ['./preferences-viewer.component.scss'],
  imports: [IonSearchbar, IonButton, IonInput, IonIcon,  IonItem, IonLabel,   IonContent, IonLabel, IonItem, IonList, IonIcon, IonFab, FormsModule, CommonModule],
})
export class PreferencesViewerComponent implements OnInit, AfterViewInit, OnChanges, DoCheck {
  keys: string[] = [];
  LSDataSource: { [key: string]: { type: string, value: any, question: string } } = {};
  @ViewChildren('IonInput') IonInput!: QueryList<IonInput>;
  searchText: string = "";
  filteredKeys: string[] = [];
  serialNumber: number = 0;
  @ViewChild('preQuestionRef', { static: true }) preQuestionRef!: IonSearchbar;



  constructor(private router: Router) {
    addIcons({ trashBin, trash, trashSharp, pencil, create, arrowUndo })
  }

  ngOnInit() {

  }
  ngOnChanges(changes: SimpleChanges): void {
    this.updateFilteredKeys();
  }
  ngDoCheck(): void {
    this.updateFilteredKeys();
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
      let question = locStorage?.question ?? "Text box";

      try {
        this.LSDataSource[key] = { type: type || "", value: value, question: question || "" };
      } catch {
        this.LSDataSource[key] = { type: type || "", value, question: question || "" };
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
        setlocalStorageData(input.name, value, matchedObj?.type, matchedObj?.question);
      }
    }
  }
  clearPreference(data: any) {
    removeLocalStorageData(data);

    this.keys = this.keys.filter(key => key !== data);
  }
  removeAllPreferences() {
    this.keys.forEach(key => removeLocalStorageData(key));
    this.keys = [];
  }

  updateFilteredKeys(event?: Event) {

    const query = this.preQuestionRef.value?.toLowerCase() || '';
    this.filteredKeys = this.keys.filter(key => {
      const question = this.LSDataSource[key]?.question || '';
      return question.toLowerCase().includes(query.toLowerCase());
    });
  }

  
incrementAndGet(): number {
  return ++this.serialNumber;
}

}
