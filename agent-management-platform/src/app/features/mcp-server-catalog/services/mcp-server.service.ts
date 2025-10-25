// src/app/features/mcp-server-catalog/services/mcp-server.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';
import { McpServer, ServerFilters, ServerListResponse } from '../models/mcp-server.interface';
import { environment } from '@env/environment';

@Injectable({
providedIn: 'root'
})
export class McpServerService {
private readonly http = inject(HttpClient);
private readonly apiUrl = `${environment.apiUrl}/mcp-servers`;

// State management with BehaviorSubjects
private filtersSubject = new BehaviorSubject<ServerFilters>({});
private pageSubject = new BehaviorSubject<number>(1);

readonly filters$ = this.filtersSubject.asObservable();
readonly page$ = this.pageSubject.asObservable();

/**
* Get paginated and filtered server list
*/
readonly servers$: Observable<ServerListResponse> = combineLatest([
this.filters$,
this.page$
]).pipe(
switchMap(([filters, page]) => this.getServers(filters, page))
);

/**
* Fetch servers from API
*/
private getServers(filters: ServerFilters, page: number): Observable<ServerListResponse> {
let params = new HttpParams()
.set('page', page.toString())
.set('pageSize', '6');

if (filters.category) {
params = params.set('category', filters.category);
}
if (filters.status) {
params = params.set('status', filters.status);
}
if (filters.searchQuery) {
params = params.set('search', filters.searchQuery);
}

return this.http.get<ServerListResponse>(this.apiUrl, { params });
}

/**
* Add server to user's environment
*/
addServer(serverId: string): Observable<{ success: boolean }> {
return this.http.post<{ success: boolean }>(`${this.apiUrl}/${serverId}/add`, {});
}

/**
* Update filters
*/
updateFilters(filters: Partial<ServerFilters>): void {
this.filtersSubject.next({ ...this.filtersSubject.value, ...filters });
this.pageSubject.next(1); // Reset to first page on filter change
}

/**
* Update current page
*/
updatePage(page: number): void {
this.pageSubject.next(page);
}

/**
* Reset filters
*/
resetFilters(): void {
this.filtersSubject.next({});
this.pageSubject.next(1);
}
}
