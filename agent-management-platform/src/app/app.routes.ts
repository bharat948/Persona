// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
{
path: '',
redirectTo: '/agents',
pathMatch: 'full'
},
{
path: 'agents',
loadComponent: () => import('./features/agent-catalog/containers/agent-catalog-container/agent-catalog-container.component').then(m => m.AgentCatalogContainerComponent),
canActivate: [AuthGuard]
},
{
path: 'agents/register',
loadComponent: () => import('./features/agent-registration/containers/agent-registration-container/agent-registration-container.component').then(m => m.AgentRegistrationContainerComponent),
canActivate: [AuthGuard]
},
{
path: 'servers',
loadComponent: () => import('./features/mcp-server-catalog/containers/mcp-server-catalog-container/mcp-server-catalog-container.component').then(m => m.McpServerCatalogContainerComponent),
canActivate: [AuthGuard]
},
{
path: 'tools',
loadComponent: () => import('./features/tool-integration/containers/tool-integration-container/tool-integration-container.component').then(m => m.ToolIntegrationContainerComponent),
canActivate: [AuthGuard]
},
{
path: 'chat',
loadComponent: () => import('./features/agent-chat/containers/agent-chat-container/agent-chat-container.component').then(m => m.AgentChatContainerComponent),
canActivate: [AuthGuard]
},
{
path: '**',
redirectTo: '/agents'
}
];
