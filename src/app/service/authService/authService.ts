// auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../user';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasUser());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private hasUser(): boolean {
    return !!localStorage.getItem('user');
  }

  getLoggedUser(): User | null {
    if (this.hasUser()) {
      return JSON.parse(localStorage.getItem('user')!) as User;
    }
    return null;
  }

  login(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
    this.isLoggedInSubject.next(true);
  }

  logout() {
    localStorage.removeItem('user');
    this.isLoggedInSubject.next(false);

  }
}
