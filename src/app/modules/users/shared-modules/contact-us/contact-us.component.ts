import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent implements OnInit {

  public isLogin = true;
  public currentUser = null;
  constructor(
    private authService: AuthenticationService,
  ) { }

  ngOnInit() {
    this.isLogin = this.authService.isLogin();
    this.authService.getUserInfo().subscribe(data => {
      this.currentUser = data;
    });
  }

}
