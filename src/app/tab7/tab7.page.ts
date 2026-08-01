import { Component, OnInit } from '@angular/core';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { UserPermissionsService } from '../services/user-permissions.service';
import { UserPermission } from '../models/dashboard.model';
import { roleLabel } from '../shared/utils/role-labels';
import { agentNameAr } from '../shared/utils/agent-display-name';

const PAGE_SIZE = 30;

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

  totalUsers = 0;
  totalRoleAssignments = 0;
  totalStations = 0;

  expandedRolesFor = new Set<string>();
  roleLabel = roleLabel;
  agentNameAr = agentNameAr;

  constructor(private usersSvc: UserPermissionsService) {}

  ngOnInit(): void {
    this.usersSvc.getUsers().subscribe((users) => {
      this.all = [...users].sort((a, b) => a.fullName.localeCompare(b.fullName));
      this.totalUsers = users.length;
      this.totalRoleAssignments = users.reduce((s, u) => s + u.roles.length, 0);
      this.totalStations = new Set(users.map((u) => u.srName).filter(Boolean)).size;
      this.applyFilters();
      this.loading = false;
    });
  }

  onSearch(ev: CustomEvent): void {
    this.searchTerm = ((ev.detail as any).value || '').trim().toLowerCase();
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
    this.filtered = !term
      ? this.all
      : this.all.filter((u) => {
          const hay = `${u.logonId} ${u.fullName} ${u.srName} ${agentNameAr(u.srName)} ${u.portCode}`.toLowerCase();
          return hay.includes(term);
        });
    this.visible = this.filtered.slice(0, PAGE_SIZE);
  }
}
