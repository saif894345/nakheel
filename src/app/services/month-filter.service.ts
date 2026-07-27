import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MonthFilterService {
  private monthSubject = new BehaviorSubject<string>('all');
  month$ = this.monthSubject.asObservable();

  get current(): string {
    return this.monthSubject.value;
  }

  setMonth(month: string): void {
    this.monthSubject.next(month);
  }
}
