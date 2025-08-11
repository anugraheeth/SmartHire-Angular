import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [TitleCasePipe, CommonModule, FormsModule],
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.css']
})
export class ProfileEditComponent implements OnInit {
  user: any = null;
  profile: any = {};
  editableField: string | null = null;
  role: 'employer' | 'seeker' = 'employer';

  showPasswordModal = false;
  passwordForm = {
    userID: null,
    currentPassword: '',
    newPassword: ''
  };

  showDeleteModal = false;
  deletePassword = '';

  employerFields = [
    { key: 'fullName', label: 'Full Name', editable: true },
    { key: 'email', label: 'Email', editable: false },
    { key: 'companyName', label: 'Company Name', editable: false },
    { key: 'website', label: 'Website', editable: false },
    { key: 'designation', label: 'Designation', editable: true },
    { key: 'contactNumber', label: 'Contact Number', editable: true },
    { key: 'industry', label: 'Industry', editable: true },
    { key: 'createdAt',label:"Active Since",editableField:false}
  ];

  seekerFields = [
    { key: 'fullName', label: 'Full Name', editable: true },
    { key: 'email', label: 'Email', editable: false },
    { key: 'phoneNumber', label: 'Phone Number', editable: true },
    { key: 'gender', label: 'Gender', editable: true },
    { key: 'linkedInURL', label: 'LinkedIn URL', editable: true },
    { key: 'portfolioURL', label: 'Portfolio URL', editable: true },
    { key: 'experience', label: 'Experience (Years)', editable: true },
    { key: 'skills', label: 'Skills', editable: true },
    { key: 'education', label: 'Education', editable: true },
    { key: 'address', label: 'Address', editable: true },
    { key: 'bio', label: 'Bio', editable: true }
  ];

  constructor(private http: HttpClient, private toastr: ToastrService) {}

  ngOnInit(): void {
    const loggedUser = localStorage.getItem('user');
    this.user = loggedUser ? JSON.parse(loggedUser) : null;
    if (!this.user) return;

    this.role = this.user.role.toLowerCase() as 'employer' | 'seeker';
    this.loadProfile();
  }

  loadProfile() {
    const apiUrl =
      this.role === 'employer'
        ? `https://localhost:7113/api/Profile/employer/${this.user.userId}`
        : `https://localhost:7113/api/Profile/jobseeker/${this.user.userId}`;

    this.http.get<any>(apiUrl).subscribe({
      next: (res) => {
        this.profile = res;
        this.passwordForm.userID = res.userID || res.employerID;
      },
      error: () => this.toastr.error('Failed to load profile.')
    });
  }

  enableEdit(field: string) {
    this.editableField = field;
  }

  saveField(field: string) {
    const apiUrl =
      this.role === 'employer'
        ? `https://localhost:7113/api/Profile/employer/update`
        : `https://localhost:7113/api/Profile/jobseeker/update`;

    // send full DTO
    const payload = { ...this.profile };
    
    this.http.put(apiUrl, payload, { responseType: 'text' }).subscribe({
      next: () => {
        this.toastr.success(`${field} updated successfully.`);
        this.editableField = null;
      },
      error: () => this.toastr.error(`Failed to update ${field}.`)
    });
  }


  deleteProfile() {
    if (!confirm('Are you sure you want to delete your profile?')) return;

    const apiUrl =
      this.role === 'employer'
        ? `https://localhost:7113/api/Profile/employer/${this.profile.employerID}`
        : `https://localhost:7113/api/Profile/jobseeker/${this.profile.userID}`;

    this.http.delete(apiUrl, { responseType: 'text' }).subscribe({
      next: () => {
        this.toastr.success('Profile deleted successfully.');
        localStorage.clear();
        location.href = '/';
      },
      error: () => this.toastr.error('Failed to delete profile.')
    });
  }

  openDeleteModal() {
  this.deletePassword = '';
  this.showDeleteModal = true;
}

closeDeleteModal() {
  this.showDeleteModal = false;
}

confirmDeleteProfile() {
  if (!this.deletePassword.trim()) {
    this.toastr.warning('Please enter your password.');
    return;
  }

  const apiUrl = `https://localhost:7113/api/Profile/delete?userId=${this.profile.userID || this.profile.employerID}&password=${encodeURIComponent(this.deletePassword)}`;

  this.http.delete(apiUrl, { responseType: 'text' }).subscribe({
    next: () => {
      this.toastr.success('Profile deleted successfully.');
      localStorage.clear();
      location.href = '/';
    },
    error: () => this.toastr.error('Failed to delete profile.')
  });
}



  // Password Modal Actions
  openPasswordModal() {
    this.passwordForm.currentPassword = '';
    this.passwordForm.newPassword = '';
    this.showPasswordModal = true;
  }

  closePasswordModal() {
    this.showPasswordModal = false;
  }

  updatePassword() {
    const apiUrl = `https://localhost:7113/api/Profile/change-password`;
    this.http.post(apiUrl, this.passwordForm, { responseType: 'text' }).subscribe({
      next: () => {
        this.toastr.success('Password updated successfully.');
        this.closePasswordModal();
        localStorage.clear();
        location.href = '/'; // logout
      },
      error: () => this.toastr.error('Failed to update password.')
    });
  }
}
