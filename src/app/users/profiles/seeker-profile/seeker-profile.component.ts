import { Component, OnInit } from '@angular/core';
import { User } from '../../../user';
import { SideBarComponent } from '../../../Shared/side-bar/side-bar.component';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Jobs } from '../../../Models/jobs.model';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { JobSeeker } from '../../../Models/jobSeeker.model';
import { Application } from '../../../Models/application';

@Component({
  selector: 'app-seeker-profile',
  imports: [CommonModule,SideBarComponent,FormsModule,RouterModule],
  templateUrl: './seeker-profile.component.html',
  styleUrl: './seeker-profile.component.css'
})
export class SeekerProfileComponent {
 User: User | null = null;
  Role: string | null = null;
  Jobs: Jobs[] = [];
  filteredJobs: Jobs[] = [];
  jobSeeker:any;
  selectedMenu: string = '';
  searchQuery: string = '';
  selectedCategory: string = '';
  selectedLocation: string = '';
  userResume : any;
  applications: Application[] = [];

  selectedFile: File | null = null;
  coverLetter: string = '';

  // Loading states
  isLoadingApplications: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';

  // Get unique categories and locations for filters
  get categories(): string[] {
    const cats = [...new Set(this.Jobs.map(job => job.category).filter(cat => cat))];
    return cats;
  }

  get locations(): string[] {
    const locs = [...new Set(this.Jobs.map(job => job.companyLocation).filter(loc => loc))];
    return locs;
  }

  menuItems = [
    { label: 'Browse Jobs', value: 'jobs' },
    { label: 'My Applications', value: 'applications'},
    { label: 'Saved Jobs', value: 'saved' }
  ];

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const loggedUser = localStorage.getItem('user');
    this.User = loggedUser ? JSON.parse(loggedUser) : null;
    this.Role = this.User?.role.toLowerCase() ?? null;
    this.getProfile();
    this.getResumes();
    this.getAllActiveJobs();
    this.selectedMenu = 'jobs';
    this.onMenuChange(this.selectedMenu);
  }

  onMenuChange(value: string) {
    this.selectedMenu = value;
    if(value=='applications')
    {
      this.getApplication();
    }
  }

  getProfile() {
    if (!this.User) return;
    
    this.http.get<JobSeeker>(`https://localhost:7113/api/Profile/jobseeker/${this.User.userId}`)
      .subscribe({
        next: (res) => {
          this.jobSeeker = res;
        },
        error: (err) => {
          this.toastr.error("Oops! Profile couldn't be fetched!");
          console.error("Failed to fetch profile details", err);
        }
      });
  }

  getAllActiveJobs() {
    this.http.get<Jobs[]>('https://localhost:7113/api/Job/Alljobs')
      .subscribe({
        next: (res) => {
          // Filter only active jobs
          this.Jobs = res.filter(job => job.isActive === true);
          this.filteredJobs = [...this.Jobs];
        },
        error: (err) => {
          this.toastr.error("Failed to fetch jobs!");
          console.error("Failed to fetch jobs", err);
        }
      });
  }
//applications
  getApplication(): void {
    this.isLoadingApplications = true;
    this.hasError = false;
    this.errorMessage = '';

    this.http.get<Application[]>(`https://localhost:7113/api/Application/jobseeker/${this.User?.userId}`)
      .subscribe({
        next: (res) => {
          this.applications = res;
          this.isLoadingApplications = false;
        },
        error: (err) => {
          this.applications = [];
          this.isLoadingApplications = false;
          this.hasError = true;
          
          if (err.status === 404) {
            this.errorMessage = "No applications found for this job.";
            this.toastr.info("No applications found for this job", "Info");
          } else {
            this.errorMessage = "Failed to fetch applications. Please try again.";
            this.toastr.error("Failed to fetch applications", "Error");
          }
          console.error("Failed to fetch applications", err);
        }
      });
  }

  // Enhanced methods for the new template functionality
  getApplicationsByStatus(status: string): Application[] {
    return this.applications.filter(app => app.status === status);
  }
    getApplicationBorderClass(status: string): string {
    const classes: { [key: string]: string } = {
      'pending': 'border-warning',
      'accepted': 'border-success',
      'rejected': 'border-danger'
    };
    return classes[status] || 'border-secondary';
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'pending': 'bg-warning text-dark',
      'accepted': 'bg-success',
      'rejected': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'pending': 'bi bi-clock',
      'accepted': 'bi bi-check-circle',
      'rejected': 'bi bi-x-circle'
    };
    return icons[status] || 'bi bi-question-circle';
  }

  getResumes(){
    this.http.get(`https://localhost:7113/api/Resume/seeker/${this.User?.userId}`)
    .subscribe({
      next:(res) =>{
        this.userResume = res;
      },
      error: (err) => {
          this.toastr.warning("No Resume Uploaded!");
        }
    });
  }

  onSearch() {
    this.filterJobs();
  }

  onCategoryChange() {
    this.filterJobs();
  }

  onLocationChange() {
    this.filterJobs();
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedLocation = '';
    this.filteredJobs = [...this.Jobs];
  }

  private filterJobs() {
    this.filteredJobs = this.Jobs.filter(job => {
      const matchesSearch = !this.searchQuery || 
        job.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        job.companyName.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesCategory = !this.selectedCategory || job.category === this.selectedCategory;
      const matchesLocation = !this.selectedLocation || job.companyLocation === this.selectedLocation;

      return matchesSearch && matchesCategory && matchesLocation;
    });
  }

  applyToJob(job: Jobs) {
    if (!this.User) {
      this.toastr.error("Please login to apply for jobs");
      return;
    }

    if(this.userResume==null){
      this.getResumes();
      if(this.userResume == null)
      {
        this.toastr.warning("You need a valid Resume to apply!!");
        return ;
      }
    }

    const applicationData = {
      jobID: job.jobID,
      jobSeekerID: this.User.userId,
      resumeID:this.userResume.resumeID
    };
    this.http.post('https://localhost:7113/api/Application', applicationData, { responseType: 'text' })
      .subscribe({
        next: (res) => {
          this.toastr.success(res);
        },
        error: (err) => {
          this.toastr.error(err);
          console.error("Application error", err);
        }
      });
  }

   // application Utility methods



  getTotalApplicationsCount(): number {
    return this.applications.length;
  }

  getPendingApplicationsCount(): number {
    return this.getApplicationsByStatus('pending').length;
  }

  getAcceptedApplicationsCount(): number {
    return this.getApplicationsByStatus('accepted').length;
  }

  getRejectedApplicationsCount(): number {
    return this.getApplicationsByStatus('rejected').length;
  }

  goBackToJobs(): void {
    this.onMenuChange('jobs');
  }


  //resume 
  onFileSelected(event: any) {
  this.selectedFile = event.target.files[0];
}

uploadResume() {
  if (!this.selectedFile) {
    this.toastr.warning("Please select a file before uploading");
    return;
  }

  const formData = new FormData();
  formData.append('file', this.selectedFile);

  // Step 1: Upload to Azure
  this.http.post<{ Url?: string; url?: string }>(
    'https://localhost:7113/api/Resume/upload-azure', 
    formData
  ).subscribe({
    next: (azureRes) => {
      // console.log('Azure upload response:', azureRes);

      const filePath = azureRes.Url || azureRes.url;
      if (!filePath) {
        this.toastr.error("Azure upload succeeded but no file URL returned");
        return;
      }

      // Step 2: Build DTO exactly like Swagger
      const resumeData = {
        userID: this.User?.userId ?? 0,
        coverLetter: this.coverLetter || '',
        filePath: filePath
        // No need to send uploadedOn — backend sets it
      };

      // Step 3: Save to DB
      this.http.post('https://localhost:7113/api/Resume', resumeData, {
        headers: { 'Content-Type': 'application/json' }
      }).subscribe({
        next: () => {
          this.toastr.success("Resume uploaded successfully");
          this.getResumes();
          this.selectedFile = null;
          this.coverLetter = '';
        },
        error: (err) => {
          console.error('DB save error:', err);
          this.toastr.error("Failed to save resume in DB");
        }
      });
    },
    error: (err) => {
      console.error('Azure upload error:', err);
      this.toastr.error("Azure upload failed");
    }
  });
}


}
