// src/app/features/mcp-server-catalog/models/mcp-server.interface.ts

export enum ServerStatus {
Available = 'AVAILABLE',
InUse = 'IN_USE',
Maintenance = 'MAINTENANCE',
Offline = 'OFFLINE'
}

export enum ServerCategory {
Compute = 'COMPUTE',
DataProcessing = 'DATA_PROCESSING',
Storage = 'STORAGE',
GPU = 'GPU',
Research = 'RESEARCH'
}

export interface McpServer {
id: string;
name: string;
description: string;
status: ServerStatus;
category: ServerCategory;
icon: string;
specifications?: {
cpu?: string;
memory?: string;
storage?: string;
gpu?: string;
};
createdAt: Date;
updatedAt: Date;
}

export interface ServerFilters {
category?: ServerCategory;
status?: ServerStatus;
searchQuery?: string;
}

export interface PaginationParams {
page: number;
pageSize: number;
totalItems: number;
totalPages: number;
}

export interface ServerListResponse {
servers: McpServer[];
pagination: PaginationParams;
}
