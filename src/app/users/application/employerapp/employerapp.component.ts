import { Component, OnInit } from '@angular/core';
import { User } from '../../../user';
import { AuthService } from '../../../service/authService/authService';
import { JobsService } from '../../../service/jobService/jobService';
import { HttpClient } from '@angular/common/http';
import { Jobs } from '../../../Models/jobs.model';
import { CommonModule } from '@angular/common';
import { SideBarComponent } from '../../../Shared/side-bar/side-bar.component';
import { Application } from '../../../Models/application';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employerapp',
  imports: [CommonModule, FormsModule, SideBarComponent],
  templateUrl: './employerapp.component.html',
  styleUrls: ['./employerapp.component.css']
})
export class EmployerappComponent implements OnInit {
  User: User | null = null;
  Jobs: Jobs[] = [];
  applications: Application[] = [];
  selectedMenu: string = '';
  selectedJob: Jobs | null = null;
  menuItems: { label: string; value: any ; route?:any}[] = [];
  
  // Loading states
  isLoadingApplications: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private jobService: JobsService,
    private toaster: ToastrService,
    private router : Router
  ) {}

  ngOnInit(): void {
    this.User = this.authService.getLoggedUser();
    this.jobService.fetchPostedJobs();

    this.jobService.jobs$.subscribe(jobs => {
      this.Jobs = jobs;
      this.menuItems = [
        ...jobs.map(job => ({
          label: `${job.title} (${job.applicationsCount || 0})`,
          value: job.jobID
        })),
        {
          label: '←  Back to Jobs',
          value: 'back',
          route: '/employer/home'
        }
      ];

      const viewSelect = this.jobService.getSelected();
      if (viewSelect) {
        this.onMenuChange(viewSelect);
      }
    });
  }

  onMenuChange(jobId: any): void {
    if(jobId==='back') return;
    this.selectedMenu = String(jobId);
    this.selectedJob = this.Jobs.find(job => String(job.jobID) === String(jobId)) || null;
    this.getApplication();
  }

  getApplication(): void {
    if (!this.selectedMenu) return;

    this.isLoadingApplications = true;
    this.hasError = false;
    this.errorMessage = '';

    this.http.get<Application[]>(`https://localhost:7113/api/Application/job/${this.selectedMenu}`)
      .subscribe({
        next: (res) => {
          this.applications = res;
          this.isLoadingApplications = false;
          // console.log('Applications loaded:', this.applications);
        },
        error: (err) => {
          this.applications = [];
          this.isLoadingApplications = false;
          this.hasError = true;
          
          if (err.status === 404) {
            this.errorMessage = "No applications found for this job.";
            this.toaster.info("No applications found for this job", "Info");
          } else {
            this.errorMessage = "Failed to fetch applications. Please try again.";
            this.toaster.error("Failed to fetch applications", "Error");
          }
          console.error("Failed to fetch applications", err);
        }
      });
  }

  onStatusChange(application: Application): void {
    const originalStatus = application.status; // Store original in case we need to revert
    
    console.log('Status changed to:', application.status);
    const appID = application.applicationID;
    const newStatus = application.status;

    this.http.put("https://localhost:7113/api/Application", {
      applicationID: appID,
      status: newStatus
    }, { responseType: "text" }).subscribe({
      next: (res) => {
        this.toaster.success(`Application status updated to ${newStatus}`, "Success");
        console.log('Status update response:', res);
      },
      error: (err) => {
        // Revert the status change in UI if API call fails
        application.status = originalStatus;
        this.toaster.error("Failed to update application status", "Error");
        console.error("Failed to update application status", err);
      }
    });
  }

  getStatusStyle(status: string): { [key: string]: string } {
    switch (status) {
      case 'pending':
        return {
          'color': '#856404',
          'background-color': '#fff3cd',
          'border-color': '#ffc400'
        };
      case 'accepted':
        return {
          'color': '#155724',
          'background-color': '#d4edda',
          'border-color': '#28a745'
        };
      case 'rejected':
        return {
          'color': '#721c24',
          'background-color': '#f8d7da',
          'border-color': '#dc3545'
        };
      default:
        return {};
    }
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

  // Action methods for the enhanced UI
  viewApplicantProfile(application: Application): void {
    this.toaster.info("Applicant profile view functionality to be implemented", "Info");
    console.log('Viewing profile for applicant:', application.jobSeekerID);
    // TODO: Implement navigation to applicant profile or open modal
  }

  downloadResume(application: Application): void {
  if (!application.resumeID) {
    this.toaster.warning("No resume available for this applicant", "Warning");
    return;
  }

  // Step 1: Fetch Resume by ID
  this.http.get<any>(`https://localhost:7113/api/Resume/${application.resumeID}`)
    .subscribe({
      next: (resume) => {
        if (resume && resume.filePath) {
          // Step 2: Open in a new tab
          window.open(resume.filePath, '_blank');
        } else {
          this.toaster.warning("Resume file not found", "Warning");
        }
      },
      error: () => {
        this.toaster.error("Failed to fetch resume", "Error");
      }
    });
}


  sendMessage(application: Application): void {
    this.toaster.info("Messaging functionality to be implemented", "Info");
    console.log('Sending message to applicant:', application.jobSeekerID);
    // TODO: Implement messaging functionality
  }

  shareJobPosting(): void {
    if (this.selectedJob) {
      // TODO: Implement job sharing functionality
      this.toaster.info("Job sharing functionality to be implemented", "Info");
      console.log('Sharing job posting:', this.selectedJob.jobID);
    }
  }

  goBackToJobs(): void {
    this.router.navigate(['/employer/home']);
  }

  editJob(job: Jobs): void {
    this.toaster.info("Job editing functionality to be implemented", "Info");
    console.log('Editing job:', job.jobID);
    // TODO: Implement job editing functionality
  }

  viewJobStatistics(job: Jobs): void {
    this.toaster.info("Job statistics view to be implemented", "Info");
    console.log('Viewing statistics for job:', job.jobID);
    // TODO: Implement job statistics view
  }

  // Utility methods
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

  refreshApplications(): void {
    if (this.selectedJob) {
      this.getApplication();
      this.toaster.info("Applications refreshed", "Info");
    }
  }

  // Bulk actions for future enhancement
  bulkStatusUpdate(applications: Application[], newStatus: string): void {
    // TODO: Implement bulk status update functionality
    this.toaster.info("Bulk status update functionality to be implemented", "Info");
    console.log('Bulk updating applications to status:', newStatus);
  }

  exportApplications(): void {
    // TODO: Implement export functionality (CSV, Excel, PDF)
    this.toaster.info("Export functionality to be implemented", "Info");
    console.log('Exporting applications for job:', this.selectedJob?.jobID);
  }

  filterApplicationsByStatus(status: string): void {
    // TODO: Implement client-side filtering
    console.log('Filtering applications by status:', status);
  }

  searchApplications(searchTerm: string): void {
    // TODO: Implement client-side search functionality
    console.log('Searching applications with term:', searchTerm);
  }
}