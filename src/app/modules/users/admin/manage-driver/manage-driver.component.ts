import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/shared/models/user';
import { AdminService } from 'src/app/core/http/admin-service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-manage-driver',
  templateUrl: './manage-driver.component.html',
  styleUrls: ['./manage-driver.component.css']
})
export class ManageDriverComponent implements OnInit {

  public drivers: User[] = [];
  public pagination: {
    page: number,
    pageLimit: number,
    totalDocuments: number
  } = {
      page: Number(1),
      pageLimit: Number(10),
      totalDocuments: Number(0)
    };
  public searchText = '';
  constructor(
    private adminService: AdminService,
    private route: Router
  ) { }

  ngOnInit() {
    this.getAllDrivers(this.pagination);
  }

  private getAllDrivers(pagination) {
    this.adminService.getDriverList(pagination).subscribe(data => {
      this.drivers = data.driver;
      this.pagination['page'] = data.page;
      this.pagination['pageLimit'] = data.pageLimit;
      this.pagination['totalDocuments'] = data.totalDocuments;
    })
  }

  goToDriverDetail(driverId) {
    this.route.navigate(["/admin/driver-detail"], { queryParams: { driverId } });
  }

  selectChangeHandler(event, user) {
    let value = event.target.value;
    const toSend = {
      type: 2,
      actionType: parseInt(value),
      id: user._id,
      email: user.email
    }
    this.adminService.manageUserPermission(toSend).subscribe(data => {
      if (data && (toSend.actionType == 1 || toSend.actionType == 0)) {
        this.drivers = this.drivers.map(elem => {
          if (elem._id == data._id) {
            elem['permission'] = data.permission;
          }
          return elem;
        })
      }
      if (data && toSend.actionType == 2) {
        this.drivers = this.drivers.map(elem => {
          if (elem._id == user._id) {
            return null
          }
          return elem;
        });
        this.drivers = this.drivers.filter(elem => elem != null);
      }
    })
  }

  paginate(page) {
    this.pagination['page'] = page;
    this.getAllDrivers(this.pagination);
  }

  changePaginate(event) {
    this.pagination['pageLimit'] = event.target.value;
    this.getAllDrivers(this.pagination);
  }

  searchDrivers() {
    let pagination = {
      page: 1,
      paginate: 10,
      searchString: this.searchText
    };
    this.getAllDrivers(pagination);
  }

  openAlert(event, user) {
    let action = event.target.value == 0 ? 'resume': event.target.value == 1 ? 'suspend' : 'delete';
    Swal.fire({
      title: `Are you sure you want to ${action} this account?`,
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
