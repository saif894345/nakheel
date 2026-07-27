import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { Transaction } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardDataService {
  private transactions$?: Observable<Transaction[]>;

  constructor(private http: HttpClient) {}

  getTransactions(): Observable<Transaction[]> {
    if (!this.transactions$) {
      this.transactions$ = this.http
        .get<Transaction[]>('assets/data/transactions.json')
        .pipe(shareReplay(1));
    }
    return this.transactions$;
  }
}
