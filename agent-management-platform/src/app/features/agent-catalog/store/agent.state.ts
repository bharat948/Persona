// src/app/features/agent-catalog/store/agent.state.ts

import { Agent, AgentFilters, AgentSorting } from '../models/agent.interface';

export interface AgentState {
agents: Agent[];
selectedAgent: Agent | null;
filters: AgentFilters;
sorting: AgentSorting;
pagination: {
page: number;
pageSize: number;
totalItems: number;
totalPages: number;
};
loading: boolean;
error: string | null;
}

export const initialAgentState: AgentState = {
agents: [],
selectedAgent: null,
filters: {},
sorting: {
field: 'createdAt' as any,
direction: 'DESC' as any
},
pagination: {
page: 1,
pageSize: 10,
totalItems: 0,
totalPages: 0
},
loading: false,
error: null
};
