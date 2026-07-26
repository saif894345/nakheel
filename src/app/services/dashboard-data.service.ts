import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { DashboardData, Transaction } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardDataService {
  private dashboard$?: Observable<DashboardData>;
  private transactions$?: Observable<Transaction[]>;

  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<DashboardData> {
    if (!this.dashboard$) {
      this.dashboard$ = this.http
        .get<DashboardData>('assets/data/dashboard-data.json')
        .pipe(shareReplay(1));
    }
    return this.dashboard$;
  }

  getTransactions(): Observable<Transaction[]> {
    if (!this.transactions$) {
      this.transactions$ = this.http
        .get<Transaction[]>('assets/data/transactions.json')
        .pipe(shareReplay(1));
    }
    return this.transactions$;
  }
}
