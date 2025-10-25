// src/app/features/tool-integration/services/tool-integration.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest, switchMap, tap } from 'rxjs';
import { Tool, ToolConfiguration, ToolFilters } from '../models/tool.interface';
import { environment } from '@env/environment';

@Injectable({
providedIn: 'root'
})
export class ToolIntegrationService {
private readonly http = inject(HttpClient);
private readonly apiUrl = `${environment.apiUrl}/tools`;

// State management
private filtersSubject = new BehaviorSubject<ToolFilters>({});
private refreshSubject = new BehaviorSubject<void>(undefined);

readonly filters$ = this.filtersSubject.asObservable();

/**
* Get tools with reactive filters
*/
readonly tools$: Observable<Tool[]> = combineLatest([
this.filters$,
this.refreshSubject
]).pipe(
switchMap(([filters]) => this.getTools(filters))
);

/**
* Fetch tools from API
*/
private getTools(filters: ToolFilters): Observable<Tool[]> {
let params = new HttpParams();

if (filters.category) {
params = params.set('category', filters.category);
}
if (filters.searchQuery) {
params = params.set('search', filters.searchQuery);
}

return this.http.get<Tool[]>(this.apiUrl, { params });
}

/**
* Get tool by ID
*/
getToolById(toolId: string): Observable<Tool> {
return this.http.get<Tool>(`${this.apiUrl}/${toolId}`);
}

/**
* Add tool to agent
*/
addTool(toolId: string, agentId: string): Observable<{ success: boolean }> {
return this.http.post<{ success: boolean }>(`${this.apiUrl}/${toolId}/add`, { agentId }).pipe(
tap(() => this.refresh())
);
}

/**
* Configure tool
*/
configureTool(toolId: string, config: ToolConfiguration): Observable<Tool> {
return this.http.put<Tool>(`${this.apiUrl}/${toolId}/configure`, config).pipe(
tap(() => this.refresh())
);
}

/**
* Remove tool from agent
*/
removeTool(toolId: string, agentId: string): Observable<{ success: boolean }> {
return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${toolId}/remove`, {
body: { agentId }
}).pipe(
tap(() => this.refresh())
);
}

/**
* Update filters
*/
updateFilters(filters: Partial<ToolFilters>): void {
this.filtersSubject.next({ ...this.filtersSubject.value, ...filters });
}

/**
* Reset filters
*/
resetFilters(): void {
this.filtersSubject.next({});
}

/**
* Refresh tool list
*/
refresh(): void {
this.refreshSubject.next();
}
}
