import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/apiservice.service';
import { IonInput } from "@ionic/angular/standalone";

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  imports: [IonInput]
})
export class DetailsComponent implements OnInit, AfterViewInit {

  constructor(private apiService: ApiService) { }

  ngOnInit() { }

  ngAfterViewInit(): void {
    this.chatResponse();
  }

  chatResponse() {
    this.apiService.chatResponseIn$.subscribe(result => {
      if (result) {
        console.log("Chat response: ", result);
      }
    })
  }

}
