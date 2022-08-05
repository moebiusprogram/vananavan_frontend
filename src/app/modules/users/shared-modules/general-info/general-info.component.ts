import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
@Component({
  selector: 'app-general-info',
  templateUrl: './general-info.component.html',
  styleUrls: ['./general-info.component.css']
})
export class GeneralInfoComponent implements OnInit {

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
