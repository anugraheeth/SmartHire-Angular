import { Component, OnInit } from '@angular/core';
import { User } from '../../user';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Jobs } from '../../Models/jobs.model';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../service/authService/authService';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-guest',
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './guest.component.html',
  styleUrl: './guest.component.css'
})
export class GuestComponent {
  User: User | null = null;
  Jobs: Jobs[] = [];
  filteredJobs: Jobs[] = [];
  searchQuery: string = '';
  selectedCategory: string = '';
  selectedLocation: string = '';

  // Get unique categories and locations for filters
  get categories(): string[] {
    const cats = [...new Set(this.Jobs.map(job => job.category).filter(cat => cat))];
    return cats;
  }

  get locations(): string[] {
    const locs = [...new Set(this.Jobs.map(job => job.companyLocation).filter(loc => loc))];
    return locs;
  }


  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router,
    private authService : AuthService
  ) {}

  ngOnInit(): void {
    const loggedUser = this.authService.getLoggedUser();
    this.User = loggedUser??null;
    this.getAllActiveJobs();

  }


  getAllActiveJobs() {
    this.http.get<Jobs[]>(`${environment.apiUrl}/Job/Alljobs`)
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
}
}
