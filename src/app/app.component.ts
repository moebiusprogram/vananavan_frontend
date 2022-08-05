import { Component, OnInit } from '@angular/core';
import { SharedChatService } from './core/http/shared-chat-service';
// import { ToasterConfig } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(
    private sharedChatService: SharedChatService
  ) {
  }

  ngOnInit() {
    this.sharedChatService.connectUser();
  }
  // public config: ToasterConfig = new ToasterConfig({
  //   animation: 'fade',
  //   positionClass: 'toast-top-full-width',
  //   showCloseButton: true,
  //   timeout: 8000
  // });

  title = 'coop-angular';
}
