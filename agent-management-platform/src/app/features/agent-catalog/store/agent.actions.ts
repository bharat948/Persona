// src/app/features/agent-catalog/store/agent.actions.ts

import { createAction, props } from '@ngrx/store';
import { Agent, AgentFilters, AgentSorting, AgentListResponse } from '../models/agent.interface';

// Load Actions
export const loadAgents = createAction(
'[Agent Catalog] Load Agents'
);

export const loadAgentsSuccess = createAction(
'[Agent Catalog] Load Agents Success',
props<{ response: AgentListResponse }>()
);

export const loadAgentsFailure = createAction(
'[Agent Catalog] Load Agents Failure',
props<{ error: string }>()
);

// Filter Actions
export const updateFilters = createAction(
'[Agent Catalog] Update Filters',
props<{ filters: Partial<AgentFilters> }>()
);

export const updateSorting = createAction(
'[Agent Catalog] Update Sorting',
props<{ sorting: AgentSorting }>()
);

export const updatePage = createAction(
'[Agent Catalog] Update Page',
props<{ page: number }>()
);

// CRUD Actions
export const selectAgent = createAction(
'[Agent Catalog] Select Agent',
props<{ agent: Agent }>()
);

export const invokeAgent = createAction(
'[Agent Catalog] Invoke Agent',
props<{ agentId: string; input: unknown }>()
);

export const deleteAgent = createAction(
'[Agent Catalog] Delete Agent',
props<{ agentId: string }>()
);

export const deleteAgentSuccess = createAction(
'[Agent Catalog] Delete Agent Success',
props<{ agentId: string }>()
);

export const deleteAgentFailure = createAction(
'[Agent Catalog] Delete Agent Failure',
props<{ error: string }>()
);
