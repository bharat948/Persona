// src/app/store/app.state.ts

import { AgentState } from '@features/agent-catalog/store/agent.state';
import { ServerState } from '@features/mcp-server-catalog/store/server.state';
import { ToolState } from '@features/tool-integration/store/tool.state';
import { ChatState } from '@features/agent-chat/store/chat.state';

export interface AppState {
agents: AgentState;
servers: ServerState;
tools: ToolState;
chat: ChatState;
}
