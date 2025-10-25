// src/app/features/agent-catalog/store/agent.reducer.ts

import { createReducer, on } from '@ngrx/store';
import { AgentState, initialAgentState } from './agent.state';
import * as AgentActions from './agent.actions';

export const agentReducer = createReducer(
initialAgentState,

// Load Agents
on(AgentActions.loadAgents, (state) => ({
...state,
loading: true,
error: null
})),

on(AgentActions.loadAgentsSuccess, (state, { response }) => ({
...state,
agents: response.agents,
pagination: response.pagination,
loading: false
})),

on(AgentActions.loadAgentsFailure, (state, { error }) => ({
...state,
loading: false,
error
})),

// Update Filters
on(AgentActions.updateFilters, (state, { filters }) => ({
...state,
filters: { ...state.filters, ...filters },
pagination: { ...state.pagination, page: 1 }
})),

on(AgentActions.updateSorting, (state, { sorting }) => ({
...state,
sorting
})),

on(AgentActions.updatePage, (state, { page }) => ({
...state,
pagination: { ...state.pagination, page }
})),

// Select Agent
on(AgentActions.selectAgent, (state, { agent }) => ({
...state,
selectedAgent: agent
})),

// Delete Agent
on(AgentActions.deleteAgentSuccess, (state, { agentId }) => ({
...state,
agents: state.agents.filter(a => a.id !== agentId)
})),

on(AgentActions.deleteAgentFailure, (state, { error }) => ({
...state,
error
}))
);
