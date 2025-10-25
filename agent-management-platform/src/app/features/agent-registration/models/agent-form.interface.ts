// src/app/features/agent-registration/models/agent-form.interface.ts

export interface AgentMetadata {
name: string;
version: string;
description: string;
author: string;
}

export interface McpServerConfig {
serverId: string;
serverName: string;
config: Record<string, any>;
}

export interface ThirdPartyIntegration {
id: string;
name: string;
enabled: boolean;
logoUrl: string;
}

export interface AgentFormData {
metadata: AgentMetadata;
mcpServers: McpServerConfig[];
integrations: ThirdPartyIntegration[];
}

export enum RegistrationStep {
AgentDetails = 1,
McpConfiguration = 2,
Integrations = 3
}

export interface RegistrationProgress {
currentStep: RegistrationStep;
totalSteps: number;
percentComplete: number;
}
