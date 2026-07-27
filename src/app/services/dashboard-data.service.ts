import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, shareReplay } from 'rxjs';
import { Transaction } from '../models/dashboard.model';
import { canonicalAgent } from '../shared/utils/agent-alias';

@Injectable({ providedIn: 'root' })
export class DashboardDataService {
  private transactions$?: Observable<Transaction[]>;

  constructor(private http: HttpClient) {}

  getTransactions(): Observable<Transaction[]> {
    if (!this.transactions$) {
      this.transactions$ = this.http.get<Transaction[]>('assets/data/transactions.json').pipe(
        map((rows) => rows.map((t) => ({ ...t, agent: canonicalAgent(t.agent) }))),
        shareReplay(1)
      );
    }
    return this.transactions$;
  }
}
