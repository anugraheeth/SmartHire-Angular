import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import  { jwtDecode }  from 'jwt-decode';
import { Router,RouterModule } from '@angular/router';
import { User } from '../user';
import { AuthService } from '../service/authService/authService';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-login',
  imports: [FormsModule,CommonModule,RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  token = '';
  decoded: any = null;
  message ='';
  expiration = '';
  User : User | null = null;

  constructor( private http:HttpClient , 
               private router: Router ,
               public authService :AuthService,
               private toastr: ToastrService) { }
  

  ngOnInit(): void {
    const user = this.authService.getLoggedUser();
    if (user!=null) {
      this.router.navigate([`${user.role}/home`]);
    }
  }

  login(){
    const loginPayload = {email: this.email,password: this.password}

    const apiUrl = `${environment.apiUrl}/Authentication/login`;

    this.http.post<any>(apiUrl,loginPayload).subscribe(
      {
        next:(res) =>
        {
          this.message = res.message;
          this.token = res.token;
          this.expiration = res.exipration;
          this.toastr.success(this.message);
          try {
            
            this.decoded = jwtDecode(res.token);
            if(this.decoded)
            {
              this.User = {
              userId : parseInt(this.decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]),
              email : this.decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
              token : this.token,
              role : this.decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
              }
              localStorage.setItem('user', JSON.stringify(this.User));
              this.authService.login(this.User);
              if(this.User.role =='admin'){
                this.router.navigate(['admin/home']);
              }
              else if(this.User.role =='employer')
              {
                this.router.navigate(['employer/home']);
              }
              else if(this.User.role =='seeker')
              {
                this.router.navigate(['seeker/home']);
              }

            }
          } catch (error) {
            console.error('Invalid JWT:', error);
          }
        },
        error: (err) => {
          this.toastr.error(err.error.message);
        console.error('Login failed:', err);
        }

      }
    )
  }
}
