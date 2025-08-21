import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { SignupFormComponent } from './dynamic-signin/signup-form/signup-form.component';
import { AuthGuard } from './guard/auth.guard';
import { RoleSelectionComponent } from './dynamic-signin/role-selection/role-selection.component';
import { EmployerProfileComponent } from './users/profiles/employer-profile/employer-profile.component';
import { EmployerappComponent } from './users/application/employerapp/employerapp.component';
import { SeekerProfileComponent } from './users/profiles/seeker-profile/seeker-profile.component';
import { ProfileEditComponent } from './users/profiles/profile-edit/profile-edit.component';
import { AboutComponent } from './Shared/about/about.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { GuestComponent } from './users/guest/guest.component';

export const routes: Routes = [
    //unguarded routes
    { path : 'login',component:LoginComponent},
    { path :'role-selection',component:RoleSelectionComponent},
    { path : 'signup/:role',component:SignupFormComponent},
    { path : 'guest', component:GuestComponent},
    { path : 'forgot-password',component:ForgotPasswordComponent},

    //guarded routes
    { path : 'admin/home',component:HomeComponent,canActivate :[AuthGuard],data: { roles: ['admin'] }},
    { path : 'employer/home',component:EmployerProfileComponent , canActivate:[AuthGuard],data: { roles: ['employer'] }},
    { path : 'employer/applications',component:EmployerappComponent,canActivate :[AuthGuard],data: { roles: ['employer'] }},
    { path : 'seeker/home',component:SeekerProfileComponent,canActivate :[AuthGuard],data: { roles: ['seeker'] }},
    { path : 'profile/edit',component:ProfileEditComponent,canActivate :[AuthGuard],data: { roles: ['employer', 'seeker'] }},
    { path : 'about',component:AboutComponent,canActivate :[AuthGuard],data: { roles: ['admin', 'employer', 'seeker'] }},
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    

    { path: '**', redirectTo: '/login' }
];
