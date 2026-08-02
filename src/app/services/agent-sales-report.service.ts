import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, shareReplay } from 'rxjs';
import { AgentSalesReportRow } from '../models/dashboard.model';
import { canonicalAgent } from '../shared/utils/agent-alias';

@Injectable({ providedIn: 'root' })
export class AgentSalesReportService {
  private rows$?: Observable<AgentSalesReportRow[]>;

  constructor(private http: HttpClient) {}

  getRows(): Observable<AgentSalesReportRow[]> {
    if (!this.rows$) {
      const bust = Date.now();
      this.rows$ = this.http
        .get<AgentSalesReportRow[]>(`assets/data/agent-sales-report.json?v=${bust}`)
        .pipe(
          map((rows) => rows.map((r) => ({ ...r, agent: canonicalAgent(r.agent) }))),
          shareReplay(1)
        );
    }
    return this.rows$;
  }
}
