import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';
@Injectable()
export class LoaderService {
  // isLoading = new Subject<boolean>();

  constructor(
    private loader: NgxUiLoaderService
  ) {

  }

  show() {
    this.loader.start();
    // this.isLoading.next(true);
  }
  hide() {
    this.loader.stop();
    // this.isLoading.next(false);
  }
}
