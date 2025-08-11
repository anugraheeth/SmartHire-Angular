import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Jobs } from '../../Models/jobs.model';
import { AuthService } from '../authService/authService';

@Injectable({ providedIn: 'root' })
export class JobsService {
  private jobsSubject = new BehaviorSubject<Jobs[]>([]);
  private selectedJob = new BehaviorSubject<number|null>(null);
  jobs$ = this.jobsSubject.asObservable();
  selected$=this.selectedJob.asObservable();


  constructor(private http: HttpClient, private authService: AuthService) {}

  setJobs(jobs: Jobs[]) {
    this.jobsSubject.next(jobs);
  }

  getJobs(): Jobs[] {
    return this.jobsSubject.getValue();
  }

  fetchPostedJobs() {
    const user = this.authService.getLoggedUser();
    if (!user) return;

    this.http
      .get<Jobs[]>(`https://localhost:7113/api/Job/employer/postedJobs/${user.userId}`)
      .subscribe({
        next: (res) => this.setJobs(res),
        error: (err) => console.error('Failed to fetch jobs posted', err),
      });
  }

  //viewApplication
  setSelected(jobs:number|null){
    this.selectedJob.next(jobs);
  }

  getSelected(): number | null {
    return this.selectedJob.getValue();
  }

}
