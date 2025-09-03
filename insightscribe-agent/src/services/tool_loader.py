from typing import Dict, Any, List
import importlib
import os
import inspect
import logging

from ..tools.base import BaseTool

logger = logging.getLogger(__name__)

class ToolLoader:
    """Dynamically loads tools based on configuration."""

    def __init__(self):
        self.available_tools: Dict[str, type[BaseTool]] = self._discover_tools()

    def _discover_tools(self) -> Dict[str, type[BaseTool]]:
        """
        Discovers all classes inheriting from BaseTool in the tools directory.
        """
        tools_dir = os.path.join(os.path.dirname(__file__), "..", "tools")
        discovered = {}
        for filename in os.listdir(tools_dir):
            if filename.endswith(".py") and not filename.startswith("__"):
                module_name = f"src.tools.{filename[:-3]}"
                try:
                    module = importlib.import_module(module_name)
                    for name, obj in inspect.getmembers(module):
                        if inspect.isclass(obj) and issubclass(obj, BaseTool) and obj is not BaseTool:
                            discovered[name] = obj
                            logger.info(f"Discovered tool: {name} from {module_name}")
                except Exception as e:
                    logger.error(f"Error loading tools from {module_name}: {e}")
        return discovered

    def load_tools(self, allowed_tool_names: List[str]) -> Dict[str, BaseTool]:
        """
        Instantiates and returns tools specified in allowed_tool_names.
        """
        loaded_tools = {}
        for tool_name in allowed_tool_names:
            if tool_name in self.available_tools:
                try:
                    loaded_tools[tool_name] = self.available_tools[tool_name]()
                    logger.info(f"Loaded tool: {tool_name}")
                except Exception as e:
                    logger.error(f"Error instantiating tool {tool_name}: {e}")
            else:
                logger.warning(f"Requested tool '{tool_name}' not found in available tools.")
        return loaded_tools

# Singleton instance
tool_loader = ToolLoader()
