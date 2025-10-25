// src/app/features/tool-integration/models/tool.interface.ts

export enum ToolCategory {
DataSource = 'DATA_SOURCE',
Communication = 'COMMUNICATION',
Productivity = 'PRODUCTIVITY',
Payments = 'PAYMENTS',
CustomerSupport = 'CUSTOMER_SUPPORT',
Marketing = 'MARKETING'
}

export enum ToolStatus {
Available = 'AVAILABLE',
Connected = 'CONNECTED',
Error = 'ERROR'
}

export interface Tool {
id: string;
name: string;
description: string;
category: ToolCategory;
status: ToolStatus;
logoUrl: string;
isConfigured: boolean;
configuration?: ToolConfiguration;
}

export interface ToolConfiguration {
apiKey?: string;
apiToken?: string;
webhookUrl?: string;
permissions: ToolPermission[];
}

export interface ToolPermission {
id: string;
name: string;
description: string;
enabled: boolean;
required: boolean;
}

export interface ToolConfigForm {
apiKey: string;
apiToken: string;
permissions: Record<string, boolean>;
}

export interface ToolFilters {
category?: ToolCategory;
searchQuery?: string;
}
