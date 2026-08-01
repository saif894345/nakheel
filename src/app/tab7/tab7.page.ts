import { Component, OnInit } from '@angular/core';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { UserPermissionsService } from '../services/user-permissions.service';
import { UserPermission } from '../models/dashboard.model';
import { roleLabel } from '../shared/utils/role-labels';
import { agentNameAr } from '../shared/utils/agent-display-name';
import { userGroup, UserGroup } from '../shared/utils/user-group';

const PAGE_SIZE = 30;

type Filter = 'all' | UserGroup;

@Component({
  selector: 'app-tab7',
  templateUrl: 'tab7.page.html',
  styleUrls: ['tab7.page.scss'],
  standalone: false,
})
export class Tab7Page implements OnInit {
  loading = true;
  all: UserPermission[] = [];
  filtered: UserPermission[] = [];
  visible: UserPermission[] = [];
  searchTerm = '';
  filter: Filter = 'all';

  totalUsers = 0;
  agentUsers = 0;
  commercialUsers = 0;
  employeeUsers = 0;

  expandedRolesFor = new Set<string>();
  roleLabel = roleLabel;
  agentNameAr = agentNameAr;
  userGroup = userGroup;

  constructor(private usersSvc: UserPermissionsService) {}

  ngOnInit(): void {
    this.usersSvc.getUsers().subscribe((users) => {
      this.all = [...users].sort((a, b) => a.fullName.localeCompare(b.fullName));
      this.totalUsers = users.length;
      this.agentUsers = users.filter((u) => userGroup(u.srCode) === 'agent').length;
      this.commercialUsers = users.filter((u) => userGroup(u.srCode) === 'commercial').length;
      this.employeeUsers = users.filter((u) => userGroup(u.srCode) === 'employee').length;
      this.applyFilters();
      this.loading = false;
    });
  }

  onSearch(ev: CustomEvent): void {
    this.searchTerm = ((ev.detail as any).value || '').trim().toLowerCase();
    this.applyFilters();
  }

  setFilter(filter: Filter): void {
    this.filter = filter;
    this.applyFilters();
  }

  toggleRoles(logonId: string): void {
    if (this.expandedRolesFor.has(logonId)) {
      this.expandedRolesFor.delete(logonId);
    } else {
      this.expandedRolesFor.add(logonId);
    }
  }

  loadMore(ev: Event): void {
    const nextLen = this.visible.length + PAGE_SIZE;
    this.visible = this.filtered.slice(0, nextLen);
    (ev as InfiniteScrollCustomEvent).target.complete();
  }

  private applyFilters(): void {
    const term = this.searchTerm;
    let list = this.all;
    if (this.filter !== 'all') {
      list = list.filter((u) => userGroup(u.srCode) === this.filter);
    }
    this.filtered = !term
      ? list
      : list.filter((u) => {
          const hay = `${u.logonId} ${u.fullName} ${u.srName} ${agentNameAr(u.srName)} ${u.portCode}`.toLowerCase();
          return hay.includes(term);
        });
    this.visible = this.filtered.slice(0, PAGE_SIZE);
  }
}
