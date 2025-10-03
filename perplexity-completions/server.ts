#!/usr/bin/env node

import express from 'express';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * HTTP server wrapper for MCP Perplexity Chat Completions
 * Uses Express with JSON-RPC protocol for MCP compliance
 * Supports SSE streaming for real-time AI responses via Perplexity API
 * Includes Basic Auth and localhost binding for security
 * Compatible with Fly.io private deployment
 */

const PORT = process.env.PORT || 8080;
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const MCP_USER = process.env.MCP_USER;
const MCP_PASS = process.env.MCP_PASS;

// Validate required environment variables
if (!PERPLEXITY_API_KEY) {
  console.error('Error: PERPLEXITY_API_KEY environment variable is required');
  process.exit(1);
}

if (!MCP_USER || !MCP_PASS) {
  console.error('Error: MCP_USER and MCP_PASS environment variables are required for authentication');
  process.exit(1);
}

/**
 * Definition of the Perplexity Chat Completions Tool.
 */
const PERPLEXITY_SEARCH_TOOL: Tool = {
  name: 'perplexity-completions',
  description:
    'Performs AI-powered web search using the Perplexity Chat Completions API. ' +
    'Returns AI-generated answers with real-time web search, citations, and sources. ' +
    'Supports SSE streaming for real-time token-by-token responses.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query or question to ask Perplexity AI',
      },
      model: {
        type: 'string',
        description: "Perplexity model: 'sonar', 'sonar-pro', 'sonar-deep-research', 'sonar-reasoning', 'sonar-reasoning-pro'",
        enum: ['sonar', 'sonar-pro', 'sonar-deep-research', 'sonar-reasoning', 'sonar-reasoning-pro'],
      },
      stream: {
        type: 'boolean',
        description: 'Enable SSE streaming for real-time token-by-token responses (default: false)',
      },
      search_mode: {
        type: 'string',
        description: "Search mode: 'web' (default), 'academic', 'sec'",
        enum: ['web', 'academic', 'sec'],
      },
      recency_filter: {
        type: 'string',
        description: "Filter results by time: 'day', 'week', 'month', 'year'",
        enum: ['day', 'week', 'month', 'year'],
      },
      reasoning_effort: {
        type: 'string',
        description: "Computational effort for deep research: 'low', 'medium', 'high' (only for sonar-deep-research)",
        enum: ['low', 'medium', 'high'],
      },
      max_tokens: {
        type: 'number',
        description: 'Maximum tokens in response (default: 1024)',
        minimum: 1,
        maximum: 4096,
      },
      temperature: {
        type: 'number',
        description: 'Sampling temperature 0-2 (default: 0.7)',
        minimum: 0,
        maximum: 2,
      },
    },
    required: ['query'],
  },
};

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
 */
function formatSearchResults(results: SearchResult[]): string {
  if (!results || results.length === 0) {
    return '';
  }

  let formatted = '\n\n## Sources\n\n';

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
 * Returns the fetch Response object for streaming or accumulated string for non-streaming.
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
): Promise<string | globalThis.Response> {
  const url = 'https://api.perplexity.ai/chat/completions';
  const model = options.model || 'sonar';
  const stream = options.stream || false;

  const body: any = {
    model,
    messages: [
      {
        role: 'user',
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
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
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
      errorText = 'Unable to parse error response';
    }
    throw new Error(
      `Perplexity API error: ${response.status} ${response.statusText}\n${errorText}`
    );
  }

  // Return response object for streaming (caller will handle SSE)
  if (stream) {
    return response;
  }

  // Handle non-streaming response
  let data: ChatCompletionResponse;
  try {
    data = await response.json();
  } catch (jsonError) {
    throw new Error(`Failed to parse JSON response: ${jsonError}`);
  }

  const content = data.choices[0]?.message?.content || 'No response generated.';
  const citations = data.search_results ? formatSearchResults(data.search_results) : '';

  return content + citations;
}

/**
 * Handles SSE streaming response from the Chat Completions API.
 */
async function handleStreamingResponse(response: globalThis.Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }

  const decoder = new TextDecoder();
  let content = '';
  let searchResults: SearchResult[] | undefined;
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim() || !line.startsWith('data: ')) {
          continue;
        }

        const data = line.slice(6); // Remove 'data: ' prefix

        if (data === '[DONE]') {
          break;
        }

        try {
          const chunk: StreamChunk = JSON.parse(data);

          // Accumulate content
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            content += delta;
            // Log streaming chunks (visible in server logs)
            process.stderr.write(delta);
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

  const citations = searchResults ? formatSearchResults(searchResults) : '';
  return content + citations;
}

/**
 * Streams Perplexity response to client using Server-Sent Events (SSE).
 */
async function streamPerplexityToSSE(
  perplexityResponse: globalThis.Response,
  expressRes: express.Response
): Promise<void> {
  const reader = perplexityResponse.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }

  // Set SSE headers
  expressRes.setHeader('Content-Type', 'text/event-stream');
  expressRes.setHeader('Cache-Control', 'no-cache');
  expressRes.setHeader('Connection', 'keep-alive');

  const decoder = new TextDecoder();
  let buffer = '';
  let searchResults: SearchResult[] | undefined;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim() || !line.startsWith('data: ')) {
          continue;
        }

        const data = line.slice(6); // Remove 'data: ' prefix

        if (data === '[DONE]') {
          // Send citations if available
          if (searchResults) {
            const citations = formatSearchResults(searchResults);
            expressRes.write(`data: ${JSON.stringify({ type: 'citations', content: citations })}\n\n`);
          }
          expressRes.write('data: [DONE]\n\n');
          expressRes.end();
          return;
        }

        try {
          const chunk: StreamChunk = JSON.parse(data);

          // Stream content delta to client
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            expressRes.write(`data: ${JSON.stringify({ type: 'content', content: delta })}\n\n`);
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

    // End stream if no [DONE] was received
    if (searchResults) {
      const citations = formatSearchResults(searchResults);
      expressRes.write(`data: ${JSON.stringify({ type: 'citations', content: citations })}\n\n`);
    }
    expressRes.write('data: [DONE]\n\n');
    expressRes.end();
  } catch (error) {
    expressRes.write(`data: ${JSON.stringify({ type: 'error', content: String(error) })}\n\n`);
    expressRes.end();
  } finally {
    reader.releaseLock();
  }
}

/**
 * Basic authentication middleware for Express.
 */
function basicAuthMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="MCP Server"');
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    if (username !== MCP_USER || password !== MCP_PASS) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    next();
  } catch {
    return res.status(401).json({ error: 'Invalid authentication format' });
  }
}

/**
 * Initializes and runs the HTTP server using Express with multiple MCP endpoints.
 */
async function runServer() {
  const app = express();

  // Middleware
  app.use(express.json({ limit: '10mb' }));

  // Root endpoint - welcome page (no auth required)
  app.get('/', (_req, res) => {
    res.json({
      name: 'Perplexity Chat Completions MCP Server',
      version: '0.1.0',
      description: 'Model Context Protocol server for Perplexity Chat Completions API',
      endpoints: {
        health: '/health',
        mcp: '/mcp',
        register: '/register',
        tools: '/mcp/tools',
        call: '/mcp/call'
      },
      authentication: 'Basic Auth',
      status: 'running'
    });
  });

  // Health check endpoint (no auth required)
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // MCP registration handshake endpoint
  app.post('/register', basicAuthMiddleware, (_req, res) => {
    res.json({
      ok: true,
      protocol: 'mcp-http',
      version: '0.1.0',
      server: {
        name: 'perplexity-completions-mcp',
        version: '0.1.0'
      }
    });
  });

  // Primary MCP endpoint - handles JSON-RPC protocol negotiation
  app.post('/mcp', basicAuthMiddleware, async (req, res) => {
    try {
      const { method, params, id } = req.body;

      // Handle initialize method
      if (method === 'initialize') {
        return res.json({
          jsonrpc: '2.0',
          id: id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {}
            },
            serverInfo: {
              name: 'perplexity-completions-mcp',
              version: '0.1.0'
            }
          }
        });
      }

      // Handle tools/list method
      if (method === 'tools/list') {
        return res.json({
          jsonrpc: '2.0',
          id: id,
          result: {
            tools: [PERPLEXITY_SEARCH_TOOL]
          }
        });
      }

      // Handle tools/call method
      if (method === 'tools/call') {
        const { name, arguments: args } = params;

        if (name === 'perplexity-completions') {
          try {
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

            const shouldStream = typeof stream === 'boolean' ? stream : false;

            const result = await performSearch(query, {
              model: typeof model === 'string' ? model : undefined,
              stream: shouldStream,
              search_mode: typeof search_mode === 'string' ? search_mode : undefined,
              recency_filter: typeof recency_filter === 'string' ? recency_filter : undefined,
              reasoning_effort: typeof reasoning_effort === 'string' ? reasoning_effort : undefined,
              max_tokens: typeof max_tokens === 'number' ? max_tokens : undefined,
              temperature: typeof temperature === 'number' ? temperature : undefined,
            });

            // Handle streaming response
            if (shouldStream && result instanceof globalThis.Response) {
              return streamPerplexityToSSE(result, res);
            }

            // Handle non-streaming response
            return res.json({
              jsonrpc: '2.0',
              id: id,
              result: {
                content: [{ type: 'text', text: result as string }]
              }
            });
          } catch (error) {
            return res.json({
              jsonrpc: '2.0',
              id: id,
              error: {
                code: -32603,
                message: error instanceof Error ? error.message : String(error)
              }
            });
          }
        } else {
          return res.json({
            jsonrpc: '2.0',
            id: id,
            error: {
              code: -32601,
              message: `Unknown tool: ${name}`
            }
          });
        }
      }

      // Handle unknown methods
      res.json({
        jsonrpc: '2.0',
        id: id || null,
        error: {
          code: -32601,
          message: `Unknown method: ${method}`
        }
      });

    } catch (error) {
      res.status(400).json({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: 'Parse error'
        }
      });
    }
  });

  // MCP tools endpoint (legacy support)
  app.get('/mcp/tools', basicAuthMiddleware, (_req, res) => {
    res.json({
      tools: [PERPLEXITY_SEARCH_TOOL],
    });
  });

  // MCP call endpoint with SSE streaming support
  app.post('/mcp/call', basicAuthMiddleware, async (req, res) => {
    try {
      const { name, arguments: args } = req.body;

      if (!args) {
        return res.status(400).json({
          error: 'No arguments provided',
          isError: true,
        });
      }

      if (name === 'perplexity-completions') {
        if (typeof args.query !== 'string') {
          return res.status(400).json({
            error: "Invalid arguments for perplexity-completions: 'query' must be a string",
            isError: true,
          });
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

        const shouldStream = typeof stream === 'boolean' ? stream : false;

        const result = await performSearch(query, {
          model: typeof model === 'string' ? model : undefined,
          stream: shouldStream,
          search_mode: typeof search_mode === 'string' ? search_mode : undefined,
          recency_filter: typeof recency_filter === 'string' ? recency_filter : undefined,
          reasoning_effort: typeof reasoning_effort === 'string' ? reasoning_effort : undefined,
          max_tokens: typeof max_tokens === 'number' ? max_tokens : undefined,
          temperature: typeof temperature === 'number' ? temperature : undefined,
        });

        // Handle streaming response
        if (shouldStream && result instanceof globalThis.Response) {
          return streamPerplexityToSSE(result, res);
        }

        // Handle non-streaming response
        return res.json({
          content: [{ type: 'text', text: result as string }],
          isError: false,
        });
      } else {
        return res.status(400).json({
          error: `Unknown tool: ${name}`,
          isError: true,
        });
      }
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : String(error),
        isError: true,
      });
    }
  });

  // Start HTTP server - bind to :: (IPv6) for Fly.io internal networking
  const httpServer = app.listen(Number(PORT), '::', () => {
    console.error(`Perplexity Chat Completions MCP Server running on port ${PORT}`);
    console.error(`Protocol: MCP 2024-11-05 with SSE streaming support`);
    console.error(`Security: Basic Auth + Fly.io private networking`);
    console.error(`Health check: http://localhost:${PORT}/health`);
    console.error(`MCP Protocol: http://localhost:${PORT}/mcp`);
    console.error(`MCP Register: http://localhost:${PORT}/register`);
    console.error(`MCP Tools: http://localhost:${PORT}/mcp/tools`);
    console.error(`MCP Call: http://localhost:${PORT}/mcp/call`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.error('SIGTERM signal received: closing HTTP server');
    httpServer.close(() => {
      console.error('HTTP server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.error('SIGINT signal received: closing HTTP server');
    httpServer.close(() => {
      console.error('HTTP server closed');
      process.exit(0);
    });
  });
}

// Start the server
runServer().catch((error) => {
  console.error('Fatal error running server:', error);
  process.exit(1);
});
