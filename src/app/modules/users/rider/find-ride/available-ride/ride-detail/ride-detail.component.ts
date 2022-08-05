import { Component, OnInit } from '@angular/core';
import { RiderService } from 'src/app/core/http/rider-service';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';

@Component({
  selector: 'app-ride-detail',
  templateUrl: './ride-detail.component.html',
  styleUrls: ['./ride-detail.component.css']
})
export class RideDetailComponent implements OnInit {

  public totalRides: number;
  public drivers: Array<any> = [];
  public selectedDriver: null;
  public isLogin = false;
  constructor(
    private riderService: RiderService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthenticationService
  ) { }

  ngOnInit() {
    this.isLogin = this.authService.isLogin();
    this.riderService.getSelectedDriver().subscribe(data => {
      if (data) {
        this.selectedDriver = data;
      } else {
        this.selectedDriver = null
      }
    });
  }

}
