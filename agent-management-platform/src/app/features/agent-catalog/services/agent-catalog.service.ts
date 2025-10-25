// src/app/features/agent-catalog/services/agent-catalog.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest, switchMap, debounceTime, distinctUntilChanged, tap } from 'rxjs';
import { Agent, AgentFilters, AgentSorting, AgentListResponse, SortField, SortDirection } from '../models/agent.interface';
import { environment } from '@env/environment';

@Injectable({
providedIn: 'root'
})
export class AgentCatalogService {
private readonly http = inject(HttpClient);
private readonly apiUrl = `${environment.apiUrl}/agents`;

// State management
private filtersSubject = new BehaviorSubject<AgentFilters>({});
private sortingSubject = new BehaviorSubject<AgentSorting>({
field: SortField.CreatedAt,
direction: SortDirection.Desc
});
private pageSubject = new BehaviorSubject<number>(1);
private pageSizeSubject = new BehaviorSubject<number>(10);

readonly filters$ = this.filtersSubject.asObservable();
readonly sorting$ = this.sortingSubject.asObservable();
readonly page$ = this.pageSubject.asObservable();
readonly pageSize$ = this.pageSizeSubject.asObservable();

/**
* Get agents with reactive state
*/
readonly agents$: Observable<AgentListResponse> = combineLatest([
this.filters$.pipe(debounceTime(300), distinctUntilChanged()),
this.sorting$,
this.page$,
this.pageSize$
]).pipe(
switchMap(([filters, sorting, page, pageSize]) =>
this.getAgents({ filters, sorting, page, pageSize })
)
);

/**
* Fetch agents from API
*/
private getAgents(params: {
filters: AgentFilters;
sorting: AgentSorting;
page: number;
pageSize: number;
}): Observable<AgentListResponse> {
let httpParams = new HttpParams()
.set('page', params.page.toString())
.set('pageSize', params.pageSize.toString())
.set('sortField', params.sorting.field)
.set('sortDirection', params.sorting.direction);

if (params.filters.category) {
httpParams = httpParams.set('category', params.filters.category);
}
if (params.filters.searchQuery) {
httpParams = httpParams.set('search', params.filters.searchQuery);
}
if (params.filters.isActive !== undefined) {
httpParams = httpParams.set('isActive', params.filters.isActive.toString());
}

return this.http.get<AgentListResponse>(this.apiUrl, { params: httpParams });
}

/**
* Get agent by ID
*/
getAgentById(agentId: string): Observable<Agent> {
return this.http.get<Agent>(`${this.apiUrl}/${agentId}`);
}

/**
* Invoke agent
*/
invokeAgent(agentId: string, input: unknown): Observable<{ result: unknown }> {
return this.http.post<{ result: unknown }>(`${this.apiUrl}/${agentId}/invoke`, { input });
}

/**
* Delete agent
*/
deleteAgent(agentId: string): Observable<{ success: boolean }> {
return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${agentId}`);
}

/**
* Update filters
*/
updateFilters(filters: Partial<AgentFilters>): void {
this.filtersSubject.next({ ...this.filtersSubject.value, ...filters });
this.pageSubject.next(1); // Reset to first page
}

/**
* Update sorting
*/
updateSorting(sorting: AgentSorting): void {
this.sortingSubject.next(sorting);
}

/**
* Update page
*/
updatePage(page: number): void {
this.pageSubject.next(page);
}

/**
* Update page size
*/
updatePageSize(pageSize: number): void {
this.pageSizeSubject.next(pageSize);
this.pageSubject.next(1); // Reset to first page
}

/**
* Reset all filters and sorting
*/
reset(): void {
this.filtersSubject.next({});
this.sortingSubject.next({
field: SortField.CreatedAt,
direction: SortDirection.Desc
});
this.pageSubject.next(1);
}
}
