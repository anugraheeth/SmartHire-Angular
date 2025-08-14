// home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Employer } from '../Models/employer.model';
import { SideBarComponent } from '../Shared/side-bar/side-bar.component';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions, ChartConfiguration } from 'chart.js';
import { User } from '../user';
import { JobSeeker } from '../Models/jobSeeker.model';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../service/authService/authService';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, SideBarComponent, NgChartsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  
  User: User | null = null;
  employers: Employer[] = [];
  jobSeekers: JobSeeker[] = [];
  allEmployers: Employer[] = []; // Store all employers for filtering
  allJobSeekers: JobSeeker[] = []; // Store all job seekers for filtering
  selectedMenu: string = '';
  selectedFilter: string = '';
  term: string = '';
  stats: any = null;
  
  // Pie chart configuration
  pieChartData: ChartData<'pie', number[], string> = {
    labels: ['Approved Users', 'Unapproved Users'],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['#28a745', '#dc3545'],
        hoverBackgroundColor: ['#218838', '#c82333'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  //sidebar menu
  menuItems = [
    { label: 'Dashboard', value: 'dashboard' },
    { label: 'Employers', value: 'employers' },
    { label: 'Seekers', value: 'seekers' }
  ];

  constructor(private http: HttpClient, private toastr: ToastrService,private authService:AuthService) {}

  ngOnInit(): void {
    const loggedUser = this.authService.getLoggedUser();
    this.User = loggedUser ?? null;
    this.getStats();
    // Auto-load dashboard when component initializes
    this.selectedMenu = 'dashboard';
    this.onMenuChange(this.selectedMenu);
  }

  setupPieChart() {
    if (!this.stats) return;

    // console.log('Setting up pie chart with stats:', this.stats);

    const approvedUsers = this.stats.approvedUsers || 0;
    const unapprovedUsers = this.stats.unapprovedUsers || 0;

    if (approvedUsers === 0 && unapprovedUsers === 0) {
      console.log('No user approval data available');
      return;
    }

    this.pieChartData = {
      labels: ['Approved Users', 'Unapproved Users'],
      datasets: [
        {
          data: [approvedUsers, unapprovedUsers],
          backgroundColor: ['#28a745', '#dc3545'],
          hoverBackgroundColor: ['#218838', '#c82333'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }
      ]
    };

    // console.log('Pie chart data set:', this.pieChartData);
  }

  // Utility Functions
  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getActiveUsersCount(): number {
    if (!this.stats) return 0;
    return (this.stats.activeEmployerCount || 0) + (this.stats.activeSeekerCount || 0);
  }

  // CSS Class Helpers
  getEmployerBorderClass(employer: Employer): string {
    if (employer.isAproved && employer.isActive) return 'border-success';
    if (!employer.isAproved) return 'border-warning';
    if (!employer.isActive) return 'border-danger';
    return 'border-secondary';
  }

  getSeekerBorderClass(seeker: JobSeeker): string {
    return seeker.isActive ? 'border-success' : 'border-danger';
  }

  getApprovalBadgeClass(isApproved: boolean): string {
    return isApproved ? 'bg-success' : 'bg-warning';
  }

  getActiveBadgeClass(isActive: boolean): string {
    return isActive ? 'bg-success' : 'bg-danger';
  }

  getApprovalIcon(isApproved: boolean): string {
    return isApproved ? 'bi bi-check-circle me-2' : 'bi bi-clock me-2';
  }

  getActiveIcon(isActive: boolean): string {
    return isActive ? 'bi bi-check-circle me-1' : 'bi bi-x-circle me-1';
  }

  // Menu and Search Functions
  onMenuChange(value: string) {
    this.selectedMenu = value;
    this.clearFilters();

    if (value === 'dashboard') {
      this.getStats();
    } else if (value === 'employers') {
      if (this.term) {
        this.getFilteredEmployers(this.term);
      } else {
        this.employers = [];
      }
    } else if (value === 'seekers') {
      if (this.term) {
        this.getFilteredSeeker(this.term);
      } else {
        this.jobSeekers = [];
      }
    }
  }

  onSearch(event: any) {
    this.term = event.target.value.trim();
    if (this.selectedMenu === 'employers') {
      if (this.term) {
        this.getFilteredEmployers(this.term);
      } else {
        this.employers = [];
      }
    } else {
      if (this.term) {
        this.getFilteredSeeker(this.term);
      } else {
        this.jobSeekers = [];
      }
    }
  }

  applyFilter() {
    // Apply filter logic based on selectedFilter value
    if (this.selectedMenu === 'employers') {
      this.filterEmployers();
    } else if (this.selectedMenu === 'seekers') {
      this.filterSeekers();
    }
  }

  clearFilters() {
    this.selectedFilter = '';
    this.term = '';
    if (this.selectedMenu === 'employers') {
      this.employers = [];
    } else if (this.selectedMenu === 'seekers') {
      this.jobSeekers = [];
    }
  }

  // NEW: Show all disapproved employers
  showDisapprovedEmployers() {
    this.toastr.info("Loading all disapproved employers...");
    this.selectedFilter = 'disapproved';
    
    this.http.get<Employer[]>(`${environment.apiUrl}/Admin/employers`)
      .subscribe({
        next: (res) => {
          // Filter only disapproved employers
          this.employers = res.filter(emp => !emp.isAproved);
          this.allEmployers = res; // Store all for future filtering
          
          if (this.employers.length > 0) {
            this.toastr.success(`Found ${this.employers.length} disapproved employers`);
          } else {
            this.toastr.info("No disapproved employers found");
          }
          
          console.log('Disapproved employers:', this.employers);
        },
        error: (err) => {
          this.toastr.error("Failed to fetch disapproved employers");
          console.error("Failed to fetch disapproved employers", err);
          this.employers = [];
        }
      });
  }


  // NEW: Get counts of disapproved users
  getDisapprovedEmployersCount(): number {
    return this.allEmployers.filter(emp => !emp.isAproved).length;
  }


  // UPDATED: Enhanced filter methods
  private filterEmployers() {
    if (!this.selectedFilter) return;
    
    // If we don't have all employers loaded, fetch them first
    if (this.allEmployers.length === 0 && ['approved', 'disapproved', 'pending', 'active', 'inactive'].includes(this.selectedFilter)) {
      this.getAllEmployers();
      return;
    }
    
    let filteredEmployers = [...this.allEmployers];
    
    switch (this.selectedFilter) {
      case 'approved':
        filteredEmployers = filteredEmployers.filter(emp => emp.isAproved);
        break;
      case 'disapproved':
      case 'pending':
        filteredEmployers = filteredEmployers.filter(emp => !emp.isAproved);
        break;
      case 'active':
        filteredEmployers = filteredEmployers.filter(emp => emp.isActive);
        break;
      case 'inactive':
        filteredEmployers = filteredEmployers.filter(emp => !emp.isActive);
        break;
      default:
        // If using search results, filter from current employers array
        filteredEmployers = [...this.employers];
        break;
    }
    
    this.employers = filteredEmployers;
    this.toastr.success(`Applied ${this.selectedFilter} filter: ${filteredEmployers.length} employers found`);
  }

  private filterSeekers() {
    if (!this.selectedFilter) return;
    
    // If we don't have all job seekers loaded, fetch them first
    if (this.allJobSeekers.length === 0 && ['disapproved', 'active', 'inactive'].includes(this.selectedFilter)) {
      this.getAllJobSeekers();
      return;
    }
    
    let filteredSeekers = [...this.allJobSeekers];
    
    switch (this.selectedFilter) {
      case 'disapproved':
        filteredSeekers = filteredSeekers.filter(seeker => 
          seeker.hasOwnProperty('isApproved') ? !(seeker as any).isApproved : false
        );
        break;
      case 'active':
        filteredSeekers = filteredSeekers.filter(seeker => seeker.isActive);
        break;
      case 'inactive':
        filteredSeekers = filteredSeekers.filter(seeker => !seeker.isActive);
        break;
      default:
        // If using search results, filter from current job seekers array
        filteredSeekers = [...this.jobSeekers];
        break;
    }
    
    this.jobSeekers = filteredSeekers;
    this.toastr.success(`Applied ${this.selectedFilter} filter: ${filteredSeekers.length} job seekers found`);
  }

  // Data Fetching Functions
  getAllEmployers() {
    this.http.get<Employer[]>(`${environment.apiUrl}/Admin/employers`)
      .subscribe({
        next: (res) => {
          console.log(res);
          this.allEmployers = res;
          this.employers = res;
          console.log(this.employers);
          
          // Apply current filter if one is selected
          if (this.selectedFilter) {
            this.filterEmployers();
          }
        },
        error: (err) => {
          this.toastr.error("Failed to fetch employers");
          console.error("Failed to fetch employers", err);
        }
      });
  }

  // NEW: Get all job seekers method
  getAllJobSeekers() {
    this.http.get<JobSeeker[]>(`${environment.apiUrl}/Admin/jobseekers`)
      .subscribe({
        next: (res) => {
          this.allJobSeekers = res;
          this.jobSeekers = res;
          
          // Apply current filter if one is selected
          if (this.selectedFilter) {
            this.filterSeekers();
          }
        },
        error: (err) => {
          this.toastr.error("Failed to fetch job seekers");
          console.error("Failed to fetch job seekers", err);
        }
      });
  }

  getStats() {
    this.http.get<any>(`${environment.apiUrl}/Admin/stats`)
      .subscribe({
        next: (res) => {
          this.toastr.success("Stats Retrieved Successfully");
          // console.log('Stats received:', res);
          this.stats = res;
          this.setupPieChart();
        },
        error: (err) => {
          this.toastr.error("Failed to load statistics");
          console.error('Failed to load stats', err);
          // Set fallback data
          this.stats = {
            employerCount: 0,
            activeEmployerCount: 0,
            inactiveEmployerCount: 0,
            seekerCount: 0,
            activeSeekerCount: 0,
            inactiveSeekerCount: 0,
            totalUsers: 0,
            inactiveUsers: 0,
            approvedUsers: 0,
            unapprovedUsers: 0
          };
          this.setupPieChart();
        }
      });
  }

  getFilteredEmployers(searchTerm: string) {
    this.http.get<Employer[]>(`${environment.apiUrl}/Admin/employer-filter`, {
      params: { searchTerm }
    }).subscribe({
      next: (res) => {
        this.employers = res;
        this.toastr.success(`Found ${res.length} employers`);
      },
      error: (err) => {
        this.employers = [];
        if (err.status === 404) {
          this.toastr.info("No employers found matching your search");
        } else {
          this.toastr.error("Failed to search employers");
        }
        console.error("Failed to fetch filtered employers", err);
      }
    });
  }

  getFilteredSeeker(searchTerm: string) {
    this.http.get<JobSeeker[]>(`${environment.apiUrl}/Admin/jobseeker-filter`, {
      params: { searchTerm }
    }).subscribe({
      next: (res) => {
        this.jobSeekers = res;
        this.toastr.success(`Found ${res.length} job seekers`);
      },
      error: (err) => {
        this.jobSeekers = [];
        if (err.status === 404) {
          this.toastr.info("No job seekers found matching your search");
        } else {
          this.toastr.error("Failed to search job seekers");
        }
        console.error("Failed to fetch filtered jobseekers", err);
      }
    });
  }

  // User Management Functions
  toggleApproval(employer: Employer) {
    const newStatus = employer.isAproved;

    this.http.post(`${environment.apiUrl}/Admin/approve-user`, {
      userID: employer.employerID,
      isApproved: newStatus
    }, { responseType: 'text' })
      .subscribe({
        next: (message) => {
          this.toastr.success(message);
          console.log(message);
          
          // Update the allEmployers array as well
          const index = this.allEmployers.findIndex(emp => emp.employerID === employer.employerID);
          if (index > -1) {
            this.allEmployers[index].isAproved = newStatus;
          }
        },
        error: (err) => {
          this.toastr.error("Failed to update approval status");
          console.error("Failed to update approval status", err);
          employer.isAproved = !newStatus;
        }
      });
  }

  toggleActivation(user: any) {
    const newStatus = user.isActive;
    const userId = user.jobSeekerID || user.employerID;

    this.http.post(`${environment.apiUrl}/Admin/activate-user`, {
      userId: userId,
      isActive: newStatus
    }, { responseType: "text" }).subscribe({
      next: (message) => {
        this.toastr.success(message);
        console.log(message);
        
        // Update the corresponding all users array
        if (user.employerID) {
          const index = this.allEmployers.findIndex(emp => emp.employerID === user.employerID);
          if (index > -1) {
            this.allEmployers[index].isActive = newStatus;
          }
        } else if (user.jobSeekerID) {
          const index = this.allJobSeekers.findIndex(seeker => seeker.jobSeekerID === user.jobSeekerID);
          if (index > -1) {
            this.allJobSeekers[index].isActive = newStatus;
          }
        }
      },
      error: (err) => {
        this.toastr.error("Failed to update activation status");
        console.error("Failed to update activation status", err);
        user.isActive = !newStatus;
      }
    });
  }

  // Refresh Functions
  refreshEmployers() {
    this.toastr.info("Refreshing employers list...");
    if (this.term) {
      this.getFilteredEmployers(this.term);
    } else if (this.selectedFilter === 'disapproved') {
      this.showDisapprovedEmployers();
    } else {
      this.getAllEmployers();
    }
  }

  refreshSeekers() {
    this.toastr.info("Refreshing job seekers list...");
    if (this.term) {
      this.getFilteredSeeker(this.term);
    }
  }

  // Export Functions
  exportEmployers() {
    this.toastr.info("Preparing employers export...");
    const csvData = this.convertEmployersToCSV();
    this.downloadCSV(csvData, 'employers_export.csv');
  }

  exportSeekers() {
    this.toastr.info("Preparing job seekers export...");
    const csvData = this.convertSeekersToCSV();
    this.downloadCSV(csvData, 'jobseekers_export.csv');
  }

  private convertEmployersToCSV(): string {
    const headers = ['ID', 'Name', 'Company', 'Email', 'Phone', 'Industry', 'Status', 'Approved', 'Created'];
    const rows = this.employers.map(emp => [
      emp.employerID,
      emp.fullName,
      emp.companyName,
      emp.email,
      emp.contactNumber,
      emp.industry,
      emp.isActive ? 'Active' : 'Inactive',
      emp.isAproved ? 'Approved' : 'Pending',
      new Date(emp.createdAt).toLocaleDateString()
    ]);

    return [headers, ...rows].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  }

  private convertSeekersToCSV(): string {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Education', 'Experience', 'Skills', 'Status', 'Created'];
    const rows = this.jobSeekers.map(seeker => [
      seeker.jobSeekerID,
      seeker.fullName,
      seeker.email,
      seeker.phoneNumber,
      seeker.education,
      seeker.experience + ' years',
      seeker.skills || 'N/A',
      seeker.isActive ? 'Active' : 'Inactive',
      new Date(seeker.createdAt).toLocaleDateString()
    ]);

    return [headers, ...rows].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  }

  private downloadCSV(csvData: string, filename: string) {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.toastr.success(`${filename} downloaded successfully`);
    }
  }
  // Notification Function
  sendNotification(user: any) {
    const userType = user.employerID ? 'employer' : 'job seeker';
    this.toastr.info(`Sending notification to ${userType}...`);
    
    // Implement notification sending logic
    setTimeout(() => {
      this.toastr.success(`Notification sent to ${user.fullName}`);
    }, 1000);
  }
}