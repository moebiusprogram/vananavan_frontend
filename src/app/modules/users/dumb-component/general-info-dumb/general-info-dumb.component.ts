import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-general-info-dumb',
  templateUrl: './general-info-dumb.component.html',
  styleUrls: ['./general-info-dumb.component.css']
})
export class GeneralInfoDumbComponent implements OnInit {

  public infoType = '';
  constructor(
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(route => {
      this.infoType = route.type;
    })
  }

}
