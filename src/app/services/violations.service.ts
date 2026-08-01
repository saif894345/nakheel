import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { Violation } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class ViolationsService {
  private violations$?: Observable<Violation[]>;

  constructor(private http: HttpClient) {}

  getViolations(): Observable<Violation[]> {
    if (!this.violations$) {
      const bust = Date.now();
      this.violations$ = this.http
        .get<Violation[]>(`assets/data/violations.json?v=${bust}`)
        .pipe(shareReplay(1));
    }
    return this.violations$;
  }
}
