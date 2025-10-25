// src/app/features/mcp-server-catalog/store/server.state.ts

import { McpServer, ServerFilters } from '../models/mcp-server.interface';

export interface ServerState {
servers: McpServer[];
selectedServer: McpServer | null;
filters: ServerFilters;
pagination: {
page: number;
pageSize: number;
totalItems: number;
totalPages: number;
};
loading: boolean;
error: string | null;
}

export const initialServerState: ServerState = {
servers: [],
selectedServer: null,
filters: {},
pagination: {
page: 1,
pageSize: 6,
totalItems: 0,
totalPages: 0
},
loading: false,
error: null
};
