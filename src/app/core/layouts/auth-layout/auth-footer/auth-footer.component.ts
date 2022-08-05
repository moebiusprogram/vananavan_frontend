import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-footer',
  templateUrl: './auth-footer.component.html',
  styleUrls: ['./auth-footer.component.css']
})
export class AuthFooterComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  goToRoute(url, routetype?: string) {
    if (!routetype) {
      this.router.navigate([url]);
    } else {
      this.router.navigate([url], { queryParams: { type: routetype } })
    }
  }

}
