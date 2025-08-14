  import { Component} from '@angular/core';
  import { User } from '../../../user';
  import { SideBarComponent } from '../../../Shared/side-bar/side-bar.component';
  import { CommonModule } from '@angular/common';
  import { HttpClient } from '@angular/common/http';
  import { Jobs } from '../../../Models/jobs.model';
  import { Employer } from '../../../Models/employer.model';
  import { ToastrService } from 'ngx-toastr';
  import { FormsModule } from '@angular/forms';
  import { Modal } from 'bootstrap';
  import { JobsService } from '../../../service/jobService/jobService';
  import { Router, RouterModule } from '@angular/router';
  import { newJob } from '../../../Models/newJob';
  import { environment } from '../../../../environments/environment';

  @Component({
    selector: 'app-employer-profile',
    imports: [CommonModule,FormsModule,SideBarComponent,RouterModule],
    templateUrl: './employer-profile.component.html',
    styleUrl: './employer-profile.component.css'
  })

  export class EmployerProfileComponent {
  User : User | null = null;
  totalJobs : number|null = null;
  totalActiveJobs : number|null = null;
  totalInactiveJobs : number|null = null;
  Role:string|null=null;
  Jobs : Jobs[] =[];
 
  originalExpiryDate: string | null = null;
  employer : any
  selectedMenu : string ='';
  selectedJob: any = {};

  newPost: newJob = {
  employerId: 0,
  title: '',
  description: '',
  companyLocation: '',
  ctc: '',
  postedDate: '',
  expiryDate: '',
  category: '',
  isActive: true
};


  menuItems =[
    {label:'Dashboard', value:'dashboard'},
    {label: 'Jobs Posted', value: 'jobs'},
    {label: 'Applications',value: 'applications', route:'/employer/applications'}
  ];

  constructor( private http: HttpClient,
                private toastr:ToastrService,
                private jobsService: JobsService,
                private router :Router
              ){}
  
  
  ngOnInit(): void {
      const loggedUser = localStorage.getItem('user');
      this.User = loggedUser ? JSON.parse(loggedUser) : null;
      this.Role = this.User?.role.toLowerCase()??null;
      this.getPostedJobs();
      this.jobsService.jobs$.subscribe(jobs => {
        this.Jobs = jobs;
        this.totalJobs= this.Jobs.length;
        this.totalActiveJobs = this.Jobs.filter(job=>job.isActive===true).length;
        this.totalInactiveJobs = this.totalJobs-this.totalActiveJobs;
        });
      this.jobsService.setSelected(null);
      this.getProfile(); 
      this.selectedMenu = 'dashboard';
      this.onMenuChange(this.selectedMenu);
    }

  onMenuChange(value : string){
    this.selectedMenu = value;
  }

  getPostedJobs() {
    if (!this.User) return;
    this.jobsService.fetchPostedJobs();
  }

  getProfile(){
    this.http.get<any>(`${environment.apiUrl}/Profile/employer/${this.User?.userId}`)
    .subscribe({
      next:(res) => {
        this.employer = res;
      },
      error: (err) =>
      {
        this.toastr.error("Oops Profile couldn't be Fetched!!");
            console.error("Failed to fetch profile details", err);
      }
    })
  }
  
  toggleActivation(job:any){
      const newStatus = job.isActive;
      const jobId = job.jobID;
      this.http.put(`${environment.apiUrl}/Job/UpdateJob/${jobId}`,{
        expiryDate: null,
        isActive: newStatus
      },{responseType:"text"}).subscribe({
        next: (message) => {
            this.toastr.success(message);
            console.log(message);
          },
          error: (err) => {
            this.toastr.error("Oops Some Error Occured!!");
            console.error("Failed to update approval status", err);
          }
      })
    }


  //form 
  openPostForm() {
    
    this.newPost.employerId = this.employer.employerID;
    this.newPost.postedDate = new Date().toISOString().slice(0, 16);

    const modalEl = document.getElementById('postForm');
    if (modalEl) {
      const modal = new Modal(modalEl);
      modal.show();
    }
  }

 save() {
  this.http.post(`${environment.apiUrl}/Job/AddJob`, this.newPost, { responseType: "text" })
    .subscribe({
      next: (res) => {
        this.toastr.success(res);
        this.getPostedJobs();
      },
      error: (err) => {
        this.toastr.error("Failed to Post new Job!!");
        console.error(err);
      }
    })
    .add(() => {
      // Always close modal (success or error)
      Modal.getInstance(
        document.getElementById('postForm')!
      )?.hide();
      this.newPost = {
          employerId: this.employer.employerID,
          title: '',
          description: '',
          companyLocation: '',
          ctc: '',
          postedDate: '',
          expiryDate: '',
          category: '',
          isActive: true
        };
    });
}

  
  
  openExpiryModal(job: any) {
    this.selectedJob = { ...job };
     this.originalExpiryDate = job.expiryDate;
    const modalEl = document.getElementById('expiryModal');
    if (modalEl) {
      const modal = new Modal(modalEl);
      modal.show();
    }
  }

  // Check if date is changed
  isDateChanged(): boolean {
    return this.selectedJob?.expiryDate !== this.originalExpiryDate;
  }

  saveExpiryDate() {
    const jobId = this.selectedJob.jobID;
    const selectedDate = new Date(this.selectedJob.expiryDate);
    const today = new Date();
    console.log(selectedDate,today);

    if (selectedDate.getDate() <= today.getDate()) {
      if (selectedDate.getDate() < today.getDate()) {
        this.toastr.error("You cannot select an old date");
      } else {
        this.toastr.error("Update with a new date!!");
      }
      return;
    }

    this.http.put(`${environment.apiUrl}/Job/UpdateJob/${jobId}`, {
      expiryDate: this.selectedJob.expiryDate,
      isActive: null
    }, { responseType: "text" })
    .subscribe({
      next: (message) => {
        this.toastr.success("Expiry date updated successfully");

        const index = this.Jobs.findIndex(j => j.jobID === jobId);
        if (index !== -1) {
          this.Jobs[index].expiryDate = this.selectedJob.expiryDate;
        }

        // Move focus before closing modal
        (document.activeElement as HTMLElement)?.blur();

        Modal.getInstance(
          document.getElementById('expiryModal')!
        )?.hide();
        this.getPostedJobs();
      },
      error: (err) => {
        this.toastr.error("Failed to update expiry date");
        console.error(err);
      }
    });
  }

  viewApplication(job:Jobs){
    const jobApplication = job.jobID;
    this.jobsService.setSelected(jobApplication);
    this.router.navigate(['/employer/applications']); 
  }

  goToApplications() {
  this.router.navigate(['/employer/applications']);
}


  }

