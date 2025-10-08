#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { Agent, fetch as undiciFetch } from 'undici';

/**
 * Create persistent HTTP agent with keep-alive for connection pooling.
 * Reduces TCP connection overhead and improves latency.
 */
const httpAgent = new Agent({
  keepAliveTimeout: 60000, // Keep connections alive for 60s
  keepAliveMaxTimeout: 120000, // Max 120s keep-alive
  pipelining: 1, // Enable HTTP pipelining
  connections: 10, // Max 10 concurrent connections per host
});

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
        description: "Enable SSE streaming for real-time token-by-token responses (default: true for faster TTFT)",
        default: true,
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
      search_context_size: {
        type: "string",
        description: "Search context depth: 'low' (faster, fewer sources), 'medium' (balanced), 'high' (comprehensive, more sources). Default: 'medium'",
        enum: ["low", "medium", "high"],
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
 * HTTP status codes that should trigger a retry.
 */
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

/**
 * Retry fetch with exponential backoff for transient failures.
 */
async function retryFetch(
  url: string,
  options: RequestInit,
  maxAttempts = 2,
  baseDelayMs = 300
): Promise<Response> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (options.signal?.aborted) {
      throw new DOMException('Request aborted', 'AbortError');
    }

    try {
      // Use keep-alive agent for persistent connections
      const response = await undiciFetch(url, { ...options as any, dispatcher: httpAgent }) as unknown as Response;

      // Return immediately if success or non-retryable error
      if (response.ok || !RETRYABLE_STATUS.has(response.status)) {
        return response;
      }

      // Last attempt - return even if failed
      if (attempt === maxAttempts - 1) {
        return response;
      }

      console.error(`[MCP] Perplexity API returned ${response.status}, retrying (attempt ${attempt + 1}/${maxAttempts})...`);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }

      if (attempt === maxAttempts - 1) {
        throw error;
      }

      console.error(`[MCP] Fetch error: ${error}, retrying (attempt ${attempt + 1}/${maxAttempts})...`);
    }

    // Exponential backoff with jitter
    const delay = baseDelayMs * Math.pow(2, attempt);
    const jitter = Math.random() * 0.3 * delay;
    await new Promise(resolve => setTimeout(resolve, delay + jitter));
  }

  throw new Error('retryFetch reached unexpected state');
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
    search_context_size?: string;
    timeout?: number;
  } = {}
): Promise<string> {
  const url = "https://api.perplexity.ai/chat/completions";
  const model = options.model || "sonar";
  const stream = options.stream !== undefined ? options.stream : true; // Default to streaming for faster TTFT
  const timeout = options.timeout || 15000; // Default 15s timeout

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
  if (options.search_context_size) {
    body.web_search_options = {
      search_context_size: options.search_context_size
    };
  }

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Diagnostic timing
  const startTime = Date.now();
  console.error(`[MCP] Starting Perplexity request at ${new Date().toISOString()}`);
  console.error(`[MCP] Request params: model=${model}, stream=${stream}, timeout=${timeout}ms`);

  let response;
  try {
    response = await retryFetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    }, 2, 300); // 2 attempts, 300ms base delay

    const duration = Date.now() - startTime;
    console.error(`[MCP] Perplexity response received after ${duration}ms (status: ${response.status})`);
    clearTimeout(timeoutId);
  } catch (error) {
    const duration = Date.now() - startTime;
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`[MCP] Request aborted after ${duration}ms (timeout: ${timeout}ms)`);
      throw new Error(`Perplexity API timeout after ${timeout}ms`);
    }
    console.error(`[MCP] Request failed after ${duration}ms: ${error}`);
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
    name: "perplexity-completions",
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
          search_context_size,
        } = args;

        const result = await performSearch(query, {
          model: typeof model === "string" ? model : undefined,
          stream: typeof stream === "boolean" ? stream : undefined,
          search_mode: typeof search_mode === "string" ? search_mode : undefined,
          recency_filter: typeof recency_filter === "string" ? recency_filter : undefined,
          reasoning_effort: typeof reasoning_effort === "string" ? reasoning_effort : undefined,
          max_tokens: typeof max_tokens === "number" ? max_tokens : undefined,
          temperature: typeof temperature === "number" ? temperature : undefined,
          search_context_size: typeof search_context_size === "string" ? search_context_size : undefined,
        });

        // Note: index.ts returns formatted text with citations, not raw Response
        // The performSearch function always returns formatted string in stdio mode
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
