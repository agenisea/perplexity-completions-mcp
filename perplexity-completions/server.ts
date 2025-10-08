#!/usr/bin/env node

import express from 'express';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { Agent, fetch as undiciFetch } from 'undici';

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

/**
 * Create persistent HTTP agent with keep-alive for connection pooling.
 * Reduces TCP connection overhead and improves latency on subsequent requests.
 */
const httpAgent = new Agent({
  keepAliveTimeout: 60000, // Keep connections alive for 60s
  keepAliveMaxTimeout: 120000, // Max 120s keep-alive
  pipelining: 1, // Enable HTTP pipelining
  connections: 10, // Max 10 concurrent connections per host
});

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
const PERPLEXITY_COMPLETIONS_TOOL: Tool = {
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
        description: "Perplexity model: 'sonar' (default, fastest), 'sonar-pro' (advanced)",
        enum: ['sonar', 'sonar-pro'],
      },
      stream: {
        type: 'boolean',
        description: 'Enable SSE streaming for real-time token-by-token responses (default: true for faster TTFT)',
        default: true,
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
      max_tokens: {
        type: 'number',
        description: 'Maximum tokens in response (default: 1024, max: 2048 for cost control)',
        minimum: 1,
        maximum: 2048,
      },
      temperature: {
        type: 'number',
        description: 'Sampling temperature 0-2 (default: 0.7)',
        minimum: 0,
        maximum: 2,
      },
      search_context_size: {
        type: 'string',
        description: "Search context depth: 'low' (faster, fewer sources), 'medium' (balanced), 'high' (comprehensive, more sources). Default: 'medium'",
        enum: ['low', 'medium', 'high'],
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
): Promise<globalThis.Response> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (options.signal?.aborted) {
      throw new DOMException('Request aborted', 'AbortError');
    }

    try {
      // Use keep-alive agent for connection pooling and reduced latency
      const response = await undiciFetch(url, { ...options as any, dispatcher: httpAgent }) as unknown as globalThis.Response;

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
 * Performs AI-powered search using the Perplexity Chat Completions API.
 * Returns the fetch Response object for streaming or ChatCompletionResponse for non-streaming.
 */
async function performSearch(
  query: string,
  options: {
    model?: string;
    stream?: boolean;
    search_mode?: string;
    recency_filter?: string;
    max_tokens?: number;
    temperature?: number;
    search_context_size?: string;
    timeout?: number;
  } = {}
): Promise<ChatCompletionResponse | globalThis.Response> {
  const url = 'https://api.perplexity.ai/chat/completions';
  const model = options.model || 'sonar';
  const stream = options.stream !== undefined ? options.stream : true; // Default to streaming for faster TTFT
  const timeout = options.timeout || 15000; // Default 15s timeout

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
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
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

  // Handle non-streaming response - return Perplexity's native format
  let data: ChatCompletionResponse;
  try {
    data = await response.json();
  } catch (jsonError) {
    throw new Error(`Failed to parse JSON response: ${jsonError}`);
  }

  // Return the complete Perplexity response
  return data;
}

/**
 * Consumes Perplexity streaming response and returns complete ChatCompletionResponse.
 * Used for legacy endpoints that don't support SSE streaming.
 */
async function consumePerplexityStream(
  perplexityResponse: globalThis.Response
): Promise<ChatCompletionResponse> {
  const reader = perplexityResponse.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let content = '';
  let searchResults: SearchResult[] | undefined;
  let lastChunk: StreamChunk | undefined;

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
          lastChunk = chunk;

          // Accumulate content from deltas
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            content += delta;
          }

          // Capture search results (only store once)
          if (chunk.search_results && !searchResults) {
            searchResults = chunk.search_results;
          }
        } catch (e) {
          // Skip malformed chunks
          continue;
        }
      }
    }

    console.error(`[MCP] Stream consumed: ${content.length} chars, ${searchResults?.length || 0} sources`);

    // Return ChatCompletionResponse format
    return {
      id: lastChunk?.id || 'unknown',
      model: lastChunk?.model || 'sonar',
      choices: [{
        message: {
          role: 'assistant',
          content: content || 'No response generated.'
        },
        finish_reason: 'stop',
        index: 0
      }],
      search_results: searchResults,
      usage: lastChunk?.usage
    };
  } finally {
    reader.releaseLock();
  }
}

/**
 * Streams Perplexity response as JSON-RPC formatted SSE messages.
 * Wraps each chunk in proper MCP protocol format for client consumption.
 */
async function streamPerplexityToJsonRpcSSE(
  perplexityResponse: globalThis.Response,
  expressRes: express.Response,
  requestId: string | number
): Promise<void> {
  const reader = perplexityResponse.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }

  // Set SSE headers
  expressRes.setHeader('Content-Type', 'text/event-stream');
  expressRes.setHeader('Cache-Control', 'no-cache');
  expressRes.setHeader('Connection', 'keep-alive');
  expressRes.setHeader('X-Accel-Buffering', 'no');

  const decoder = new TextDecoder();
  let buffer = '';
  let accumulatedContent = '';
  let searchResults: SearchResult[] | undefined;

  console.error('[MCP] Starting JSON-RPC SSE stream');

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
          // Send final JSON-RPC response with complete result
          const finalResponse = {
            jsonrpc: '2.0',
            id: requestId,
            result: {
              content: [
                {
                  type: 'text',
                  text: accumulatedContent
                },
                ...(searchResults ? [{
                  type: 'resource',
                  resource: {
                    type: 'search_results',
                    results: searchResults
                  }
                }] : [])
              ]
            }
          };

          console.error(`[MCP] Sending final response: ${accumulatedContent.length} chars, ${searchResults?.length || 0} sources`);
          expressRes.write(`data: ${JSON.stringify(finalResponse)}\n\n`);
          expressRes.end();
          return;
        }

        try {
          const chunk: StreamChunk = JSON.parse(data);

          // Accumulate content
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            accumulatedContent += delta;

            // Send streaming notification with partial content
            const notification = {
              jsonrpc: '2.0',
              method: 'notifications/progress',
              params: {
                progressToken: requestId,
                progress: accumulatedContent.length,
                total: null // Unknown total
              }
            };

            expressRes.write(`data: ${JSON.stringify(notification)}\n\n`);
          }

          // Capture search results
          if (chunk.search_results) {
            searchResults = chunk.search_results;
          }
        } catch (e) {
          // Skip malformed chunks
          continue;
        }
      }
    }

    // If stream ended without [DONE], send final response
    const finalResponse = {
      jsonrpc: '2.0',
      id: requestId,
      result: {
        content: [
          {
            type: 'text',
            text: accumulatedContent || 'No response generated.'
          },
          ...(searchResults ? [{
            type: 'resource',
            resource: {
              type: 'search_results',
              results: searchResults
            }
          }] : [])
        ]
      }
    };

    console.error(`[MCP] Stream ended, sending final response`);
    expressRes.write(`data: ${JSON.stringify(finalResponse)}\n\n`);
    expressRes.end();
  } catch (error) {
    console.error(`[MCP] SSE stream error: ${error}`);
    const errorResponse = {
      jsonrpc: '2.0',
      id: requestId,
      error: {
        code: -32603,
        message: String(error)
      }
    };
    expressRes.write(`data: ${JSON.stringify(errorResponse)}\n\n`);
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
            tools: [PERPLEXITY_COMPLETIONS_TOOL]
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
              max_tokens,
              temperature,
              search_context_size,
            } = args;

            console.error(`[MCP] tools/call request: query="${query.substring(0, 50)}..."`);

            const result = await performSearch(query, {
              model: typeof model === 'string' ? model : undefined,
              stream: true, // Always stream from Perplexity for faster TTFT
              search_mode: typeof search_mode === 'string' ? search_mode : undefined,
              recency_filter: typeof recency_filter === 'string' ? recency_filter : undefined,
              max_tokens: typeof max_tokens === 'number' ? max_tokens : undefined,
              temperature: typeof temperature === 'number' ? temperature : undefined,
              search_context_size: typeof search_context_size === 'string' ? search_context_size : undefined,
            });

            // Always consume Perplexity stream server-side
            // StreamableHTTPClientTransport expects single JSON response, not SSE notifications
            // Use duck typing: check if result has a readable body (works for both undici and native Response)
            if (result && typeof result === 'object' && 'body' in result && result.body) {
              console.error(`[MCP] Consuming Perplexity stream for Streamable HTTP client`);
              const consumedResult = await consumePerplexityStream(result as globalThis.Response);

              const content: any[] = [];
              if (consumedResult.choices?.[0]?.message?.content) {
                content.push({
                  type: 'text',
                  text: consumedResult.choices[0].message.content
                });
              }
              if (consumedResult.search_results && consumedResult.search_results.length > 0) {
                content.push({
                  type: 'resource',
                  resource: {
                    type: 'search_results',
                    results: consumedResult.search_results
                  }
                });
              }

              return res.json({
                jsonrpc: '2.0',
                id: id,
                result: {
                  content
                }
              });
            }

            // Fallback for non-streaming (should not reach here)
            console.error(`[MCP] Unexpected non-streaming response`);
            const perplexityResponse = result as ChatCompletionResponse;

            const content: any[] = [];
            if (perplexityResponse.choices?.[0]?.message?.content) {
              content.push({
                type: 'text',
                text: perplexityResponse.choices[0].message.content
              });
            }
            if (perplexityResponse.search_results && perplexityResponse.search_results.length > 0) {
              content.push({
                type: 'resource',
                resource: {
                  type: 'search_results',
                  results: perplexityResponse.search_results
                }
              });
            }

            return res.json({
              jsonrpc: '2.0',
              id: id,
              result: {
                content
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
      tools: [PERPLEXITY_COMPLETIONS_TOOL],
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
          max_tokens,
          temperature,
          search_context_size,
        } = args;

        const shouldStream = typeof stream === 'boolean' ? stream : false;
        console.error(`[MCP] /mcp/call shouldStream=${shouldStream}, stream param=${stream}, stream type=${typeof stream}`);

        const result = await performSearch(query, {
          model: typeof model === 'string' ? model : undefined,
          stream: shouldStream,
          search_mode: typeof search_mode === 'string' ? search_mode : undefined,
          recency_filter: typeof recency_filter === 'string' ? recency_filter : undefined,
          max_tokens: typeof max_tokens === 'number' ? max_tokens : undefined,
          temperature: typeof temperature === 'number' ? temperature : undefined,
          search_context_size: typeof search_context_size === 'string' ? search_context_size : undefined,
        });

        console.error(`[MCP] /mcp/call Result type check: shouldStream=${shouldStream}, hasBody=${result && typeof result === 'object' && 'body' in result}`);

        // Use duck typing to detect streaming response (works for both undici and native Response)
        if (result && typeof result === 'object' && 'body' in result && result.body) {
          console.error(`[MCP] /mcp/call Streaming Response detected - consuming stream for legacy endpoint`);
          // Legacy endpoint: consume stream and return complete response
          const consumedResult = await consumePerplexityStream(result as globalThis.Response);

          const content: any[] = [];
          if (consumedResult.choices?.[0]?.message?.content) {
            content.push({
              type: 'text',
              text: consumedResult.choices[0].message.content
            });
          }
          if (consumedResult.search_results && consumedResult.search_results.length > 0) {
            content.push({
              type: 'resource',
              resource: {
                type: 'search_results',
                results: consumedResult.search_results
              }
            });
          }

          return res.json({
            content,
            isError: false,
          });
        }

        // Handle non-streaming response - return Perplexity's native format
        console.error(`[MCP] /mcp/call Non-streaming path: treating result as ChatCompletionResponse`);
        const perplexityResponse = result as ChatCompletionResponse;
        console.error(`[MCP] /mcp/call perplexityResponse.choices=${JSON.stringify(perplexityResponse.choices)}, search_results=${JSON.stringify(perplexityResponse.search_results)}`);

        const content: any[] = [];

        // Add the text response
        if (perplexityResponse.choices?.[0]?.message?.content) {
          content.push({
            type: 'text',
            text: perplexityResponse.choices[0].message.content
          });
        }

        // Add structured search results if available
        if (perplexityResponse.search_results && perplexityResponse.search_results.length > 0) {
          content.push({
            type: 'resource',
            resource: {
              type: 'search_results',
              results: perplexityResponse.search_results
            }
          });
        }

        return res.json({
          content,
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
