// navbar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/authService/authService';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule,RouterModule,],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isLoggedIn: boolean = false;
  Role:string|null=null;
  constructor(public authService: AuthService,public router : Router ,private toastr:ToastrService) {}

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
      this.Role = this.authService.getLoggedUser()?.role?.toLowerCase() ?? null;
      console.log(this.Role);
    });
    
  }

  logout() {
    this.authService.logout();
    this.toastr.success("Logged Out SuccessFully");
    this.router.navigate(['/login']);
    this.Role=null;
  }
}
