import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/core/http/admin-service';
import { User } from 'src/app/shared/models/user';
import { Router } from '@angular/router';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-manage-user',
  templateUrl: './manage-user.component.html',
  styleUrls: ['./manage-user.component.css']
})
export class ManageUserComponent implements OnInit {

  public riders: User[] = [];
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
    this.getAllUsers(this.pagination);
  }

  private getAllUsers(pagination) {
    this.adminService.getUserList(pagination).subscribe(data => {
      this.riders = data.users;
      this.pagination['page'] = data.page;
      this.pagination['pageLimit'] = data.pageLimit;
      this.pagination['totalDocuments'] = data.totalDocuments;
    })
  }

  goToDriverDetail(riderId) {
    this.route.navigate(["/admin/rider-detail"], { queryParams: { riderId } });
  }

  selectChangeHandler(event, user) {
    let value = event.target.value;
    const toSend = {
      type: 1,
      actionType: parseInt(value),
      id: user._id,
      email: user.email
    }
    this.adminService.manageUserPermission(toSend).subscribe(data => {
      if (data && (toSend.actionType == 1 || toSend.actionType == 0)) {
        this.riders = this.riders.map(elem => {
          if (elem._id == data._id) {
            elem['permission'] = data.permission;
          }
          return elem;
        })
      }
      if (data && toSend.actionType == 2) {
        this.riders = this.riders.map(elem => {
          if (elem._id == user._id) {
            return null
          }
          return elem;
        });
        this.riders = this.riders.filter(elem => elem != null);
      }
      console.log(data, '*****')
    })
  }

  paginate(page) {
    this.pagination['page'] = page;
    this.getAllUsers(this.pagination);
  }

  changePaginate(event) {
    this.pagination['pageLimit'] = event.target.value;
    this.getAllUsers(this.pagination);
  }

   searchRiders() {
    let pagination = {
      page: 1,
      paginate: 10,
      searchString: this.searchText
    };
    this.getAllUsers(pagination);
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
