// src/app/features/agent-catalog/models/agent.interface.ts

export enum AgentCategory {
Sales = 'SALES',
Support = 'SUPPORT',
Marketing = 'MARKETING',
DataAnalysis = 'DATA_ANALYSIS',
Development = 'DEVELOPMENT'
}

export interface Agent {
id: string;
name: string;
description: string;
category: AgentCategory;
icon: string;
version: string;
author: string;
createdAt: Date;
updatedAt: Date;
isActive: boolean;
stats?: {
totalInvocations: number;
successRate: number;
averageResponseTime: number;
};
}

export interface AgentFilters {
category?: AgentCategory;
searchQuery?: string;
isActive?: boolean;
}

export enum SortField {
Name = 'name',
Category = 'category',
CreatedAt = 'createdAt',
UpdatedAt = 'updatedAt'
}

export enum SortDirection {
Asc = 'ASC',
Desc = 'DESC'
}

export interface AgentSorting {
field: SortField;
direction: SortDirection;
}

export interface AgentListParams {
filters: AgentFilters;
sorting: AgentSorting;
page: number;
pageSize: number;
}

export interface AgentListResponse {
agents: Agent[];
pagination: {
page: number;
pageSize: number;
totalItems: number;
totalPages: number;
};
}
