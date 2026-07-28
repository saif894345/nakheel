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
      // Cache-bust with a per-load timestamp: transactions.json has a fixed
      // filename (unlike the hashed JS bundles), so without this, browsers
      // - especially mobile, where there's no real "hard refresh" gesture -
      // can keep serving a stale copy from before the latest daily update.
      const bust = Date.now();
      this.transactions$ = this.http.get<Transaction[]>(`assets/data/transactions.json?v=${bust}`).pipe(
        map((rows) => rows.map((t) => ({ ...t, agent: canonicalAgent(t.agent) }))),
        shareReplay(1)
      );
    }
    return this.transactions$;
  }
}
