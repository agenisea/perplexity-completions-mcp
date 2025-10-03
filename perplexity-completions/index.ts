#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * Definition of the Perplexity Chat Completions Tool.
 * This tool performs AI-powered search using the Perplexity Chat Completions API with optional SSE streaming.
 */
const PERPLEXITY_SEARCH_TOOL: Tool = {
  name: "perplexity-completions",
  description:
    "Performs AI-powered web search using the Perplexity Chat Completions API. " +
    "Returns AI-generated answers with real-time web search, citations, and sources. " +
    "Supports SSE streaming for real-time token-by-token responses.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query or question to ask Perplexity AI",
      },
      model: {
        type: "string",
        description: "Perplexity model: 'sonar', 'sonar-pro', 'sonar-deep-research', 'sonar-reasoning', 'sonar-reasoning-pro'",
        enum: ["sonar", "sonar-pro", "sonar-deep-research", "sonar-reasoning", "sonar-reasoning-pro"],
      },
      stream: {
        type: "boolean",
        description: "Enable SSE streaming for real-time token-by-token responses (default: false)",
      },
      search_mode: {
        type: "string",
        description: "Search mode: 'web' (default), 'academic', 'sec'",
        enum: ["web", "academic", "sec"],
      },
      recency_filter: {
        type: "string",
        description: "Filter results by time: 'day', 'week', 'month', 'year'",
        enum: ["day", "week", "month", "year"],
      },
      reasoning_effort: {
        type: "string",
        description: "Computational effort for deep research: 'low', 'medium', 'high' (only for sonar-deep-research)",
        enum: ["low", "medium", "high"],
      },
      max_tokens: {
        type: "number",
        description: "Maximum tokens in response (default: 1024)",
        minimum: 1,
        maximum: 4096,
      },
      temperature: {
        type: "number",
        description: "Sampling temperature 0-2 (default: 0.7)",
        minimum: 0,
        maximum: 2,
      },
    },
    required: ["query"],
  },
};

// Retrieve the Perplexity API key from environment variables
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
if (!PERPLEXITY_API_KEY) {
  console.error("Error: PERPLEXITY_API_KEY environment variable is required");
  process.exit(1);
}

/**
 * Interface for chat completion messages.
 */
interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Interface for search results (citations) from Chat Completions API.
 */
interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
}

/**
 * Interface for usage statistics.
 */
interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

/**
 * Interface for streaming chunk delta.
 */
interface StreamDelta {
  content?: string;
  role?: string;
}

/**
 * Interface for streaming chunk choice.
 */
interface StreamChoice {
  delta: StreamDelta;
  index: number;
  finish_reason?: string | null;
}

/**
 * Interface for streaming chunk from SSE.
 */
interface StreamChunk {
  id: string;
  model: string;
  choices: StreamChoice[];
  search_results?: SearchResult[];
  usage?: Usage;
}

/**
 * Interface for non-streaming chat completion response.
 */
interface ChatCompletionResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
    index: number;
  }>;
  search_results?: SearchResult[];
  usage?: Usage;
}

/**
 * Formats search results (citations) into a readable string.
 *
 * @param {SearchResult[]} results - Array of search results from the API.
 * @returns {string} Formatted citations with sources.
 */
function formatSearchResults(results: SearchResult[]): string {
  if (!results || results.length === 0) {
    return "";
  }

  let formatted = "\n\n## Sources\n\n";

  results.forEach((result: SearchResult, index: number) => {
    formatted += `${index + 1}. **${result.title}**\n`;
    formatted += `   ${result.url}\n`;
    if (result.snippet) {
      formatted += `   ${result.snippet}\n`;
    }
    formatted += `\n`;
  });

  return formatted;
}

/**
 * Performs AI-powered search using the Perplexity Chat Completions API.
 * Supports both streaming and non-streaming responses.
 *
 * @param {string} query - The search query or question.
 * @param {object} options - Optional parameters for the API call.
 * @returns {Promise<string>} The AI-generated answer with citations.
 * @throws Will throw an error if the API request fails.
 */
async function performSearch(
  query: string,
  options: {
    model?: string;
    stream?: boolean;
    search_mode?: string;
    recency_filter?: string;
    reasoning_effort?: string;
    max_tokens?: number;
    temperature?: number;
  } = {}
): Promise<string> {
  const url = "https://api.perplexity.ai/chat/completions";
  const model = options.model || "sonar";
  const stream = options.stream || false;

  const body: any = {
    model,
    messages: [
      {
        role: "user",
        content: query,
      },
    ],
    stream,
  };

  // Add optional parameters
  if (options.search_mode) {
    body.search_mode = options.search_mode;
  }
  if (options.recency_filter) {
    body.recency_filter = options.recency_filter;
  }
  if (options.reasoning_effort) {
    body.reasoning_effort = options.reasoning_effort;
  }
  if (options.max_tokens) {
    body.max_tokens = options.max_tokens;
  }
  if (options.temperature !== undefined) {
    body.temperature = options.temperature;
  }

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw new Error(`Network error while calling Perplexity API: ${error}`);
  }

  if (!response.ok) {
    let errorText;
    try {
      errorText = await response.text();
    } catch (parseError) {
      errorText = "Unable to parse error response";
    }
    throw new Error(
      `Perplexity API error: ${response.status} ${response.statusText}\n${errorText}`
    );
  }

  // Handle streaming response
  if (stream) {
    return handleStreamingResponse(response);
  }

  // Handle non-streaming response
  let data: ChatCompletionResponse;
  try {
    data = await response.json();
  } catch (jsonError) {
    throw new Error(`Failed to parse JSON response: ${jsonError}`);
  }

  const content = data.choices[0]?.message?.content || "No response generated.";
  const citations = data.search_results ? formatSearchResults(data.search_results) : "";

  return content + citations;
}

/**
 * Handles SSE streaming response from the Chat Completions API.
 *
 * @param {Response} response - The fetch response object.
 * @returns {Promise<string>} The complete streamed response with citations.
 */
async function handleStreamingResponse(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Response body is not readable");
  }

  const decoder = new TextDecoder();
  let content = "";
  let searchResults: SearchResult[] | undefined;
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");

      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim() || !line.startsWith("data: ")) {
          continue;
        }

        const data = line.slice(6); // Remove 'data: ' prefix

        if (data === "[DONE]") {
          break;
        }

        try {
          const chunk: StreamChunk = JSON.parse(data);

          // Accumulate content
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            content += delta;
          }

          // Capture search results from final chunks
          if (chunk.search_results) {
            searchResults = chunk.search_results;
          }
        } catch (e) {
          // Skip malformed chunks
          continue;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  const citations = searchResults ? formatSearchResults(searchResults) : "";
  return content + citations;
}

// Initialize the server with tool metadata and capabilities
const server = new Server(
  {
    name: "perplexity-search",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Registers a handler for listing available tools.
 * When the client requests a list of tools, this handler returns the Perplexity Search tool.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [PERPLEXITY_SEARCH_TOOL],
}));

/**
 * Registers a handler for calling a specific tool.
 * Processes requests by validating input and invoking the appropriate tool.
 *
 * @param {object} request - The incoming tool call request.
 * @returns {Promise<object>} The response containing the tool's result or an error.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    if (!args) {
      throw new Error("No arguments provided");
    }
    switch (name) {
      case "perplexity-completions": {
        // Validate query is a string
        if (typeof args.query !== "string") {
          throw new Error("Invalid arguments for perplexity-completions: 'query' must be a string");
        }

        const {
          query,
          model,
          stream,
          search_mode,
          recency_filter,
          reasoning_effort,
          max_tokens,
          temperature,
        } = args;

        const result = await performSearch(query, {
          model: typeof model === "string" ? model : undefined,
          stream: typeof stream === "boolean" ? stream : undefined,
          search_mode: typeof search_mode === "string" ? search_mode : undefined,
          recency_filter: typeof recency_filter === "string" ? recency_filter : undefined,
          reasoning_effort: typeof reasoning_effort === "string" ? reasoning_effort : undefined,
          max_tokens: typeof max_tokens === "number" ? max_tokens : undefined,
          temperature: typeof temperature === "number" ? temperature : undefined,
        });

        return {
          content: [{ type: "text", text: result }],
          isError: false,
        };
      }
      default:
        // Respond with an error if an unknown tool is requested
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    // Return error details in the response
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Initializes and runs the server using standard I/O for communication.
 * Logs an error and exits if the server fails to start.
 */
async function runServer() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Perplexity Search MCP Server running on stdio");
  } catch (error) {
    console.error("Fatal error running server:", error);
    process.exit(1);
  }
}

// Start the server and catch any startup errors
runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
