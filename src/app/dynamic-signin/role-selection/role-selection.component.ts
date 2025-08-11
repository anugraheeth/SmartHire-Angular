import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-role-selection',
  imports: [CommonModule],
  templateUrl: './role-selection.component.html',
  styleUrls: ['./role-selection.component.css']
})
export class RoleSelectionComponent {
  @Output() roleSelected = new EventEmitter<string>();

  constructor(private router: Router) {}

  roles = [
    { 
      key: 'employer', 
      label: 'Employer',
      description: 'Post jobs, find talent, and manage your hiring process',
      iconClass: '🏢'
    },
    { 
      key: 'jobseeker', 
      label: 'Job Seeker',
      description: 'Browse opportunities, apply for jobs, and build your career',
      iconClass: '👤'
    },
  ];

  selectRole(role: any) { 
    this.roleSelected.emit(role.key);
    this.router.navigate(['/signup', role.key]);
  }
}