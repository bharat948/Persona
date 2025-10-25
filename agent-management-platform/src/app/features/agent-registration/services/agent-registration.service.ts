// src/app/features/agent-registration/services/agent-registration.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, tap } from 'rxjs';
import { AgentFormData } from '../models/agent-form.interface';
import { environment } from '@env/environment';

@Injectable({
providedIn: 'root'
})
export class AgentRegistrationService {
private readonly http = inject(HttpClient);
private readonly apiUrl = `${environment.apiUrl}/agents`;

/**
* Register a new agent
* @param agentData - Complete agent registration data
* @returns Observable<any> of the created agent
*/
registerAgent(agentData: AgentFormData): Observable<any> {
return this.http.post<any>(this.apiUrl, agentData).pipe(
tap(agent => console.log('Agent registered:', agent)),
catchError(error => {
console.error('Agent registration failed:', error);
return throwError(() => new Error('Failed to register agent'));
})
);
}

/**
* Validate agent name uniqueness
* @param name - Agent name to validate
* @returns Observable<{ available: boolean }>
*/
validateAgentName(name: string): Observable<{ available: boolean }> {
return this.http.get<{ available: boolean }>(`${this.apiUrl}/validate-name`, {
params: { name }
});
}

/**
* Get available integrations
* @returns Observable<any[]> of integration list
*/
getAvailableIntegrations(): Observable<any[]> {
return this.http.get<any[]>(`${environment.apiUrl}/integrations`);
}
}
