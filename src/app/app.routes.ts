import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { SignupFormComponent } from './dynamic-signin/signup-form/signup-form.component';
import { AuthGuard } from './guard/auth.guard';
import { RoleSelectionComponent } from './dynamic-signin/role-selection/role-selection.component';
import { EmployerProfileComponent } from './users/profiles/employer-profile/employer-profile.component';
import { EmployerappComponent } from './users/application/employerapp/employerapp.component';
import { SeekerProfileComponent } from './users/profiles/seeker-profile/seeker-profile.component';

export const routes: Routes = [
    //unguarded routes
    { path : 'login',component:LoginComponent},
    { path :'role-selection',component:RoleSelectionComponent},
    { path : 'signup/:role',component:SignupFormComponent},

    //guarded routes
    { path : 'admin/home',component:HomeComponent,canActivate :[AuthGuard]},
    { path : 'employer/home',component:EmployerProfileComponent , canActivate:[AuthGuard]},
    { path : 'employer/applications',component:EmployerappComponent},
    { path : 'seeker/home',component:SeekerProfileComponent},
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    

    { path: '**', redirectTo: '/login' }
];
