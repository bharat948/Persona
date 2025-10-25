// src/app/features/tool-integration/store/tool.state.ts

import { Tool, ToolFilters } from '../models/tool.interface';

export interface ToolState {
tools: Tool[];
selectedTool: Tool | null;
filters: ToolFilters;
loading: boolean;
error: string | null;
}

export const initialToolState: ToolState = {
tools: [],
selectedTool: null,
filters: {},
loading: false,
error: null
};
