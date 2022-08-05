import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { AdminService } from 'src/app/core/http/admin-service';
import { User } from 'src/app/shared/models/user';
import { Router } from '@angular/router';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-manage-bookings',
  templateUrl: './manage-bookings.component.html',
  styleUrls: ['./manage-bookings.component.css']
})
export class ManageBookingsComponent implements OnInit {

  public bookings = [];
  public riders: Array<User> = [];
  public drivers: Array<User> = [];
  public selectedField = {
    date: null,
    riders: [],
    drivers: [],
    bookingHistory: ''
  };
  public pagination: {
    page: number,
    pageLimit: number,
    totalDocuments: number
  } = {
      page: Number(1),
      pageLimit: Number(10),
      totalDocuments: Number(0)
    }
  public searchText = '';
  // public selectedDate = '';
  // public isCheckBoxDisable = false;
  // public maxDate = new Date();
  // public minDate = new Date();
  // public isCalendarOpen = false;
  constructor(
    private adminService: AdminService,
    private route: Router
  ) { }
  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;

  ngOnInit() {
    // this.minDate.setDate(this.minDate.getDate() - 365);
    // this.maxDate.setDate(this.maxDate.getDate() + 30);
    this.getAllBookings(this.pagination);
  }

  private getAllBookings(pagination) {
    this.adminService.getAdminBookings(pagination).subscribe(data => {
      this.bookings = data.bookings;
      this.pagination['page'] = data.page;
      this.pagination['pageLimit'] = data.pageLimit;
      this.pagination['totalDocuments'] = data.totalDocuments;
      this.riders = data.riders;
      this.drivers = data.drivers;
    })
  }

  // selectField(event, filterBy, value) {
  //   let isChecked = event.target.checked;
  //   if (filterBy == 'DATE') {
  //     this.selectedField['date'] = value;
  //   }
  //   if (filterBy == 'RIDER') {
  //     if (isChecked) {
  //       this.selectedField['riders'].push(value);
  //     } else {
  //       this.selectedField['riders'] = this.selectedField['riders'].filter(elem => elem != value);
  //     }
  //   }
  //   if (filterBy == 'DRIVER') {
  //     if (isChecked) {
  //       this.selectedField['drivers'].push(value);
  //     } else {
  //       this.selectedField['drivers'] = this.selectedField['drivers'].filter(elem => elem != value);
  //     }
  //   }
  //   if (filterBy == 'BOOKING_HISTORY') {
  //     this.selectedField['bookingHistory'] = value;
  //     if (value == 'UPCOMING') {
  //       this.minDate.setDate(this.minDate.getDate());
  //       this.maxDate.setDate(this.maxDate.getDate() + 30);
  //     }
  //     if (value == 'PAST') {
  //       this.minDate.setDate(this.minDate.getDate() - 365);
  //       this.maxDate.setDate(this.maxDate.getDate());
  //     }
  //   }
  // }

  // submitFilter() {
  //   this.updateEmptyArray();
  //   this.adminService.filterBookings({
  //     date: this.selectedField['date'] ? JSON.stringify(this.selectedField['date']) : null,
  //     riders: JSON.stringify(this.selectedField['riders']),
  //     drivers: JSON.stringify(this.selectedField['drivers']),
  //     bookingHistory: this.selectedField.bookingHistory
  //   }).subscribe(data => {
  //     this.bookings = data.filteredBookings;
  //     this.isCheckBoxDisable = false;
  //   })
  // }

  // private updateEmptyArray() {
  //   if (this.selectedField['riders'].length == 0) {
  //     this.selectedField['riders'] = this.riders.map(elem => {
  //       return elem._id
  //     })
  //   }
  //   if (this.selectedField['drivers'].length == 0) {
  //     this.selectedField['drivers'] = this.drivers.map(elem => {
  //       return elem._id
  //     })
  //   }
  // }

  // clearAllFilters() {
  //   this.getAllBookings(this.pagination);
  //   this.minDate.setDate(this.minDate.getDate() - 365);
  //   this.maxDate.setDate(this.maxDate.getDate() + 30);
  //   this.checkboxes.forEach(element => {
  //     element.nativeElement.checked = false;
  //   });
  //   this.selectedDate = '';
  //   this.isCheckBoxDisable = false;
  //   this.selectedField = {
  //     date: null,
  //     riders: [],
  //     drivers: [],
  //     bookingHistory: ''
  //   };
  // }

  // handleDateRange(event) {
  //   if (event) {
  //     this.isCheckBoxDisable = true;
  //     this.selectedField['bookingHistory'] = ''
  //     this.selectedField['date'] = event;
  //   }
  // }

  selectChangeHandler(event, id) {
    let value = event.target.value;
    const toSend = {
      type: 3,
      actionType: parseInt(value),
      id
    }
    this.adminService.manageUserPermission(toSend).subscribe((data) => {
      if (data && (toSend.actionType == 1 || toSend.actionType == 0)) {
        this.bookings = this.bookings.map(elem => {
          if (elem._id == data._id) {
            elem['permission'] = data.permission;
          }
          return elem;
        })
      }
      if (data && toSend.actionType == 2) {
        this.bookings = this.bookings.map(elem => {
          if (elem._id == id) {
            return null
          }
          return elem;
        });
        this.bookings = this.bookings.filter(elem => elem != null);
      }
    });
  }

  paginate(page) {
    this.pagination['page'] = page;
    this.getAllBookings(this.pagination);
  }

  changePaginate(event) {
    this.pagination['pageLimit'] = event.target.value;
    this.getAllBookings(this.pagination);
  }

  searchBookings() {
    let pagination = { ...this.pagination }
    pagination['searchString'] = this.searchText;
    this.getAllBookings(pagination);
  }

  goToBookingDetail(tripId) {
    this.route.navigate(["/admin/booking-detail"], { queryParams: { tripId } })
  }

  openAlert(event, user) {
    let action = event.target.value == 1 ? 'suspend' : event.target.value == 2 ? 'delete' : 'resume';
    Swal.fire({
      title: `Are you sure you want to ${action} this booking?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes!',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.selectChangeHandler(event, user);
      }
    })
  }

}
