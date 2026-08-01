import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, shareReplay } from 'rxjs';
import { UserPermission } from '../models/dashboard.model';
import { canonicalAgent } from '../shared/utils/agent-alias';

@Injectable({ providedIn: 'root' })
export class UserPermissionsService {
  private users$?: Observable<UserPermission[]>;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<UserPermission[]> {
    if (!this.users$) {
      const bust = Date.now();
      this.users$ = this.http.get<UserPermission[]>(`assets/data/user-permissions.json?v=${bust}`).pipe(
        map((rows) => rows.map((u) => ({ ...u, srName: canonicalAgent(u.srName) }))),
        shareReplay(1)
      );
    }
    return this.users$;
  }
}
