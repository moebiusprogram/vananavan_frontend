import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/shared/models/user';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.css']
})
export class AdminHeaderComponent implements OnInit {

  public currentUser: User;
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) { }

  ngOnInit() {
    this.authenticationService.getUserInfo().subscribe(data => {
      this.currentUser = data;
    });
  }

  logout() {
     this.authenticationService.logout().subscribe(value => {
      if (value) {
        this.router.navigate(['']);
      }
    });
  }

}
