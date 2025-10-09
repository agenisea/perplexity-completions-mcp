# Perplexity Chat Completions MCP Server

An MCP server implementation that integrates the Perplexity Chat Completions API to provide AI agents with AI-powered web search and real-time knowledge with **optimized streaming performance**.

> **Note:** This server uses the Perplexity Chat Completions API (`/chat/completions`) for AI-generated answers with citations. For structured search results, see [perplexity-search-mcp](https://github.com/agenisea/perplexity-search-mcp).

## Quick Start Demo

Once configured with an MCP client, you can perform AI-powered web searches:

```
User: "What are the latest AI developments in 2025?"
Assistant: [Uses perplexity-completions tool]
Assistant: "Based on real-time web research, here are the latest developments..."
```

The tool provides AI-generated answers with automatic source citations, giving MCP clients access to current information beyond their training data.

## Overview

This MCP (Model Context Protocol) server provides AI-powered web search using Perplexity's **Chat Completions API** with **performance-optimized internal streaming**. Unlike traditional search APIs, this returns AI-generated answers with real-time web research and structured source citations.

The Chat Completions API combines:
- 🤖 **AI-Generated Answers**: Natural language responses powered by Perplexity's Sonar models
- 🌐 **Real-Time Web Search**: Up-to-date information from across the internet
- 📦 **Structured Responses**: Separate text and resource blocks for easy client-side processing
- 📚 **Rich Citations**: Search results with titles, URLs, and snippets as structured resources
- ⚡ **Optimized Performance**: Internal streaming for sub-3s TTFT, server-side consumption for simple client integration

## Why This MCP Server?

**Give AI Agents Powerful Research Capabilities**: Instead of just returning search results, Perplexity's AI analyzes the web and generates comprehensive answers with citations - giving AI agents access to real-time knowledge.

**Key Benefits:**
- 🎯 **AI-Generated Answers**: Get synthesized insights with web research, not just raw search results
- 📦 **Structured Responses**: Separate text and citation blocks for easy parsing and display
- 🔗 **Rich Citations**: Search results with titles, URLs, and snippets as structured resources
- ⚡ **Optimized Performance**: Sub-3s TTFT via internal streaming, complete responses to clients
- 🎚️ **Flexible Models**: `sonar` and `sonar-pro` for fast responses (HTTP server), or all 5 Sonar models (STDIO server)
- 🔍 **Advanced Filters**: Filter by recency (day/week/month/year), search mode (web/academic/sec), context depth
- 💰 **Cost-Effective**: Starting at $1/1M tokens with the base `sonar` model
- 🛠️ **Developer-Friendly**: Simple setup with TypeScript support and clear documentation

**Perfect For:**
- Research and fact-checking current events
- Finding recent documentation and technical resources
- Discovering trending topics and emerging technologies
- Answering questions that require up-to-date information
- Building AI applications that need web search capabilities

## Tech Stack

This project is built with modern, well-documented technologies. Each component includes links to official documentation for deeper learning and troubleshooting.

### Core Technologies

- **[TypeScript](https://www.typescriptlang.org/docs/)**: Type-safe server implementation with strict typing
  - [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) - Comprehensive language guide
  - [Latest Release Notes](https://devblogs.microsoft.com/typescript/) - Stay updated with new features

- **[Model Context Protocol (MCP)](https://modelcontextprotocol.io/docs/sdk)**: Official SDK for building MCP servers
  - [MCP Specification](https://github.com/modelcontextprotocol/modelcontextprotocol) - Protocol specification and schema
  - [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) - Official TypeScript implementation
  - [MCP Documentation](https://modelcontextprotocol.io) - Complete guides and tutorials

- **[Perplexity Chat Completions API](https://docs.perplexity.ai)**: AI-powered web search with streaming support
  - [Chat Completions Guide](https://docs.perplexity.ai/guides/chat-completions) - Implementation guide
  - [Streaming Guide](https://docs.perplexity.ai/guides/streaming) - Streaming documentation
  - [API Reference](https://docs.perplexity.ai/api-reference/chat-completions-post) - Complete endpoint docs
  - [API Pricing](https://www.perplexity.ai/settings/api) - Current rates and limits

### Runtime & Package Management

- **[Node.js v18+](https://nodejs.org/download/release/v18.18.2/)**: JavaScript runtime environment
  - [Node.js Documentation](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/) - Installation and setup
  - [Node.js v18 Release Notes](https://nodejs.org/en/blog/announcements/v18-release-announce) - New features and improvements

- **[pnpm](https://pnpm.io)**: Fast, disk-efficient package manager
  - [pnpm Installation](https://pnpm.io/installation) - Setup guide for all platforms
  - [pnpm Documentation](https://pnpm.io/motivation) - Why pnpm and how it works
  - [GitHub Repository](https://github.com/pnpm/pnpm) - Source code and issue tracking

### Development & Deployment

- **[Express.js](https://expressjs.com)**: Web application framework for HTTP server mode
  - [Express.js Guide](https://expressjs.com/en/guide/routing.html) - Routing and middleware
  - [Express.js API Reference](https://expressjs.com/en/4x/api.html) - Complete API documentation
  - [Express.js Tutorial](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/Introduction) - MDN learning guide

- **[Docker](https://docs.docker.com)**: Containerization for deployment
  - [Docker Get Started](https://www.docker.com/get-started/) - Installation and basic usage
  - [Docker Documentation](https://docs.docker.com) - Complete reference and guides

- **[Fly.io](https://fly.io/docs/launch/deploy/)**: Cloud deployment platform
  - [Fly.io Deploy Guide](https://fly.io/docs/launch/deploy/) - Application deployment
  - [Fly.io CLI Reference](https://fly.io/docs/flyctl/deploy/) - Command-line tools

### Integration

- **MCP Clients**: Any application supporting Model Context Protocol
  - [MCP Client List](https://modelcontextprotocol.io/clients) - Available MCP clients
  - [MCP Integration Guide](https://modelcontextprotocol.io/docs/concepts/architecture) - Protocol architecture


## Future Compatibility

### MCP November 2025 Release Ready ✅

This project is **fully compatible** with the upcoming Model Context Protocol release on **November 25, 2025**. Our architecture choices align perfectly with the protocol's evolution.

#### **Release Timeline**
- **Release Candidate**: November 11, 2025
- **Final Release**: November 25, 2025
- **Validation Window**: 14-day RC testing period

#### **Current Configuration Benefits**
- ✅ **Transport Layer**: Uses Streamable HTTP (the future standard)
- ✅ **SDK Compatibility**: Built with official TypeScript SDK for seamless upgrades
- ✅ **Structured Responses**: Already implements structured tool outputs
- ✅ **Security Ready**: Basic auth can be enhanced with upcoming OAuth 2.1 features

#### **Upgrade Path**
The November 2025 release will be a **simple, non-breaking upgrade**:

1. **Update SDK**: `npm install @modelcontextprotocol/sdk@latest` (after November 25)
2. **Optional Enhancements**: Add new features like elicitation for user interactions
3. **Backward Compatibility**: Your existing configuration will continue working unchanged

#### **New Features Available**
- **Enhanced Security**: Optional OAuth 2.1 improvements for enterprise deployments
- **Elicitation**: Server-initiated user interactions for search refinement
- **Resource Links**: Enhanced integration between tools and data sources
- **Structured Tool Output**: Formalized schemas (already implemented in our responses)

#### **Documentation & Resources**
- [MCP November 2025 Roadmap](http://blog.modelcontextprotocol.io/posts/2025-09-26-mcp-next-version-update/) - Official release timeline and features
- [MCP Protocol Updates](https://modelcontextprotocol.io/specification/2025-03-26/changelog) - Technical changelog
- [MCP Future Roadmap](https://modelcontextprotocol.io/development/roadmap) - Long-term protocol direction

> **Stay Updated**: Monitor the [MCP GitHub repository](https://github.com/modelcontextprotocol/modelcontextprotocol) for release candidate announcements and detailed migration guides.

## Features

- 🤖 **AI-Generated Answers**: Get synthesized responses, not just raw search results
- ⚡ **Optimized Performance**: Sub-3s TTFT via internal streaming, complete responses to clients
- 📦 **Structured Responses**: Separate text and resource blocks for easy parsing
- 🔍 **Real-Time Web Search**: Access current information with automatic web research
- 📚 **Structured Citations**: Search results with titles, URLs, and snippets as resource objects
- 🎚️ **Multiple Models**: HTTP server supports `sonar` and `sonar-pro` for fast responses; STDIO server supports all 5 models including slower reasoning models
- 🔍 **Advanced Filters**:
  - Recency: Filter by `day`, `week`, `month`, `year`
  - Domain: Search `web`, `academic`, or `sec` filings
  - Search Context: Control depth with `low` (faster, fewer sources), `medium` (balanced), `high` (comprehensive)
- 🎯 **Configurable Parameters**: Control temperature, max tokens, and more
- ⚡ **Performance Features**: Keep-alive connection pooling, automatic retries, 30s timeout handling
- 🔒 **Type-Safe Implementation**: Full TypeScript support with strict typing

## Tools

### perplexity-completions

Performs AI-powered web search using Perplexity's Chat Completions API with performance-optimized internal streaming.

**Inputs:**
- `query` (string, required): Search query or question to ask Perplexity AI
- `model` (string, optional): Model to use
  - **HTTP Server (Recommended)**: `sonar` (default, fastest), `sonar-pro` (advanced) - optimized for production performance
  - **STDIO Server**: All models including `sonar-deep-research`, `sonar-reasoning`, `sonar-reasoning-pro` (slower models may cause timeouts)
- `stream` (boolean, optional): Enable internal streaming from Perplexity for faster TTFT (default: true, always returns complete response to client)
- `search_mode` (string, optional): Search mode - `web` (default), `academic`, `sec`
- `recency_filter` (string, optional): Filter by time - `day`, `week`, `month`, `year`
- `search_context_size` (string, optional): Search context depth - `low` (faster, fewer sources), `medium` (balanced, default), `high` (comprehensive, more sources)
- `max_tokens` (number, optional): Maximum tokens in response
  - **HTTP Server**: 1-2048 tokens (default: 1024) - limited for cost control
  - **STDIO Server**: 1-4096 tokens (default: 1024)
- `temperature` (number, optional): Sampling temperature 0-2 (default: 0.7)

> **Note:** The HTTP server limits models to `sonar` and `sonar-pro` and caps max_tokens at 2048 to optimize for performance and cost. Reasoning models and higher token limits are available in the STDIO server but may incur higher costs and longer response times (15-45s+).

**Output:**
Structured content array with:
- **Text block**: AI-generated natural language response
- **Resource block**: Structured search results (citations) with titles, URLs, and snippets
- Content formatted for easy parsing and display

**Example (Non-streaming):**
```json
{
  "query": "What are the latest developments in AI?",
  "model": "sonar-pro",
  "recency_filter": "week"
}
```

**Example with streaming (recommended for performance):**
```json
{
  "query": "What are the latest developments in AI?",
  "model": "sonar-pro",
  "stream": true,
  "recency_filter": "week"
}
```

## Streaming Implementation

The server uses **internal streaming from Perplexity** for optimal performance (sub-3s TTFT) but returns complete responses to MCP clients.

### How It Works

**Performance-Optimized Default Behavior:**

The server defaults to `stream: true` when calling Perplexity's API for faster time-to-first-token (2-3s vs 18-22s). However, the response format to MCP clients is always complete (not streaming):

**For HTTP Transport (Claude Code, Vercel AI SDK):**
1. **Streams from Perplexity** to reduce time-to-first-token
2. **Consumes stream server-side** for compatibility with stateless MCP clients
3. **Returns complete JSON response** with text content and structured citations
4. **Benefits:** Fast TTFT without requiring client-side stream handling

**For STDIO Transport (Claude Desktop):**
1. **Streams from Perplexity** for fast TTFT
2. **Consumes stream server-side** and accumulates content
3. **Returns formatted text** with citations appended
4. **Benefits:** Optimized performance with simple text output

### Response Format

The server always returns complete, structured responses (not SSE streams):

```json
{
  "content": [
    {
      "type": "text",
      "text": "AI has seen significant progress in 2025..."
    },
    {
      "type": "resource",
      "resource": {
        "type": "search_results",
        "results": [
          {
            "title": "AI Advances in 2025",
            "url": "https://example.com/ai-2025",
            "snippet": "Major breakthroughs in..."
          }
        ]
      }
    }
  ],
  "isError": false
}
```

**Benefits:**
- ✅ Fast time-to-first-token (2-3s) via internal streaming from Perplexity
- ✅ Simple client integration - no stream handling required
- ✅ Structured search results with title, URL, and snippet
- ✅ Compatible with MCP resource protocol
- ✅ Separate text response from citations for easier parsing

## Installation

### Prerequisites

- Node.js >= 18
- pnpm
- Perplexity API key

### Step 1: Clone and Install

```bash
git clone https://github.com/agenisea/perplexity-completions-mcp.git
cd perplexity-completions-mcp/perplexity-completions
pnpm install
```

### Step 2: Get a Perplexity API Key

1. Sign up for a [Perplexity API account](https://www.perplexity.ai/settings/api)
2. Generate your API key from the developer dashboard
3. Create a `.env.local` file in the `perplexity-completions` directory:

```bash
cp .env.local.example .env.local
```

4. Add your API key to `.env.local`:

```
PERPLEXITY_API_KEY=your_api_key_here
```

#### API Pricing & Rate Limits

The Perplexity Chat Completions API operates on a pay-as-you-go model:

- **Pricing**: Token-based pricing varies by model (check [Perplexity Pricing](https://docs.perplexity.ai/getting-started/pricing) for current rates)
  - `sonar`: $1/1M tokens (input & output) - Most cost-effective
  - `sonar-pro`: $3/1M input, $15/1M output
  - `sonar-reasoning`: $1/1M input, $5/1M output
  - `sonar-reasoning-pro`: $2/1M input, $8/1M output
  - `sonar-deep-research`: $2/1M input, $8/1M output + additional fees
- **Free Tier**: New accounts may receive initial credits for testing
- **Rate Limits**: Varies by subscription tier (see your dashboard for specific limits)
- **Credits**: Monitor your usage and credits in the [Perplexity API Settings](https://www.perplexity.ai/settings/api)

> **Tip**: Use `max_tokens` and model selection to control costs. The base `sonar` model is most cost-effective for quick searches.

### Step 3: Build the Project

```bash
pnpm run build
```

## Usage

### Local Development

**Stdio MCP Server** (for direct MCP client connections):
```bash
pnpm run dev
```

**HTTP Server** (for HTTP-based MCP clients like Claude Code):
```bash
pnpm run dev:server
```

### Production

**Stdio MCP Server**:
```bash
pnpm run start
```

**HTTP Server**:
```bash
pnpm run start:server
```

Or with explicit environment variables:

```bash
# Stdio server
PERPLEXITY_API_KEY=your_api_key node dist/index.js

# HTTP server
PERPLEXITY_API_KEY=your_api_key node dist/server.js
```

### Testing

Test the search functionality with the included test script:

```bash
node test-search.js
```

## MCP Client Configuration

### Method 1: Stdio MCP Server (Local)

For MCP clients that support stdio transport (e.g., Claude Desktop):

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "perplexity-completions": {
      "command": "node",
      "args": [
        "/absolute/path/to/perplexity-completions-mcp/perplexity-completions/dist/index.js"
      ],
      "env": {
        "PERPLEXITY_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

### Method 2: HTTP MCP Server (Local or Remote)

For MCP clients that support HTTP transport:

```json
{
  "mcpServers": {
    "perplexity-completions": {
      "url": "http://localhost:8080/mcp",
      "auth": {
        "type": "basic",
        "username": "your_username",
        "password": "your_password"
      }
    }
  }
}
```

Set these environment variables for the HTTP server:
```bash
PERPLEXITY_API_KEY=your_api_key_here
MCP_USER=your_username
MCP_PASS=your_password
```

### Method 3: Remote Deployment

The project is pre-configured for Fly.io deployment but can be adapted for other cloud platforms.

#### Fly.io Deployment (Default Configuration)

The project includes `fly.toml` and `Dockerfile` configured for **private internal deployment**. The server is not exposed to the public internet and uses internal networking for security.

**Quick Start:**
```bash
# Deploy to Fly.io (private internal configuration with auto-scaling)
fly deploy

# Set environment variables
fly secrets set PERPLEXITY_API_KEY=your_api_key_here
fly secrets set MCP_USER=your_username
fly secrets set MCP_PASS=your_password
```

**Auto-Scaling Configuration:**
The default `fly.toml` includes auto-scaling settings:
- **Minimum Machines**: 1 machine always running (required for `.internal` DNS resolution)
- **Auto-Stop/Start**: Additional machines scale up/down based on load
- **Warm Requests**: ~11-26 seconds total (depending on response size and model)

**Security Note**: The default configuration uses Fly.io's internal network (`*.internal`) for private access only. No public ports are exposed, making it suitable for secure MCP client connections.

📖 **For complete deployment instructions, see the Fly.io deployment section below**

Then configure your MCP client to use the deployed server:
```json
{
  "mcpServers": {
    "perplexity-completions": {
      "url": "https://your-app.fly.dev/mcp",
      "auth": {
        "type": "basic",
        "username": "your_username",
        "password": "your_password"
      }
    }
  }
}
```

#### AWS Deployment (Alternative)

To deploy to AWS with similar private network security, modify the configuration:

**AWS ECS/Fargate:**
1. Build and push Docker image to ECR:
```bash
# Build for AWS
docker build -t perplexity-completions-mcp .
docker tag perplexity-completions-mcp:latest your-account.dkr.ecr.region.amazonaws.com/perplexity-completions-mcp:latest
docker push your-account.dkr.ecr.region.amazonaws.com/perplexity-completions-mcp:latest
```

2. Create ECS task definition with environment variables and private networking:
```json
{
  "environment": [
    {"name": "PERPLEXITY_API_KEY", "value": "your_api_key"},
    {"name": "MCP_USER", "value": "your_username"},
    {"name": "MCP_PASS", "value": "your_password"},
    {"name": "PORT", "value": "8080"}
  ],
  "networkMode": "awsvpc"
}
```

**Note**: Deploy in private subnets with security groups allowing only necessary MCP client access.

**AWS Lambda (with serverless framework):**
1. Install serverless framework and create `serverless.yml`:
```yaml
service: perplexity-completions-mcp
provider:
  name: aws
  runtime: nodejs18.x
  environment:
    PERPLEXITY_API_KEY: ${env:PERPLEXITY_API_KEY}
    MCP_USER: ${env:MCP_USER}
    MCP_PASS: ${env:MCP_PASS}
functions:
  app:
    handler: dist/lambda.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
```

2. Create Lambda handler wrapper (`lambda.ts`):
```typescript
import serverlessExpress from '@vendia/serverless-express';
import app from './server.js';
export const handler = serverlessExpress({ app });
```

#### Other Cloud Platforms

**Google Cloud Run (Private):**
```bash
gcloud run deploy perplexity-completions-mcp \
  --image gcr.io/your-project/perplexity-completions-mcp \
  --platform managed \
  --no-allow-unauthenticated \
  --ingress internal \
  --set-env-vars PERPLEXITY_API_KEY=your_key,MCP_USER=user,MCP_PASS=pass
```

**Azure Container Instances:**
```bash
az container create \
  --resource-group myResourceGroup \
  --name perplexity-completions-mcp \
  --image your-registry/perplexity-completions-mcp \
  --environment-variables PERPLEXITY_API_KEY=your_key MCP_USER=user MCP_PASS=pass
```

**Heroku:**
```bash
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set PERPLEXITY_API_KEY=your_key MCP_USER=user MCP_PASS=pass

# Deploy
git push heroku main
```

### Using Docker

Build and run with Docker:

```bash
# Build the Docker image
docker build -t perplexity-completions-mcp perplexity-completions/

# Run the container (stdio mode)
docker run -i --rm -e PERPLEXITY_API_KEY=your_api_key_here perplexity-completions-mcp

# Run the container (HTTP mode)
docker run -p 8080:8080 --rm \
  -e PERPLEXITY_API_KEY=your_api_key_here \
  -e MCP_USER=your_username \
  -e MCP_PASS=your_password \
  perplexity-completions-mcp node dist/server.js
```

Access the config file:

```bash
# macOS
vim ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Windows
notepad %APPDATA%\Claude\claude_desktop_config.json
```

## Verifying the Integration

1. Open your MCP client
2. Look for the tools/integrations menu
3. You should see `perplexity-completions` listed as an available tool
4. Test with a simple query to verify functionality

If the tool appears and responds correctly, the integration is active!

## Advanced Configuration

You can customize search parameters directly in your tool calls:

**Fast search with fewer sources:**
```json
{
  "query": "latest AI developments",
  "model": "sonar",
  "search_context_size": "low",
  "recency_filter": "day"
}
```

**Comprehensive research with more sources:**
```json
{
  "query": "quantum computing breakthroughs",
  "model": "sonar-pro",
  "search_context_size": "high",
  "search_mode": "academic",
  "max_tokens": 2048
}
```

**Deep research with reasoning (STDIO server only):**
```json
{
  "query": "AI safety implications",
  "model": "sonar-deep-research",
  "temperature": 0.2
}
```
> **Note:** Deep research and reasoning models are only available in the STDIO server due to longer response times (30-60s+) that may exceed HTTP client timeouts.

Refer to the official [Perplexity Chat Completions API documentation](https://docs.perplexity.ai/api-reference/chat-completions-post) for more details.

## About the Perplexity Chat Completions API

The [Perplexity Chat Completions API](https://docs.perplexity.ai/api-reference/chat-completions-post) combines AI language models with real-time web search, providing comprehensive answers with automatic source citations.

### Key Capabilities

**AI-Generated Answers with Web Research**
- Synthesizes information from multiple sources into coherent responses
- Combines language model capabilities with real-time web search
- Returns natural language answers instead of raw search results
- Automatically includes source citations with every response

**5 Specialized Sonar Models**
- **sonar**: Lightweight, cost-effective model for quick searches ($1/1M tokens) - **Available in both servers**
- **sonar-pro**: Advanced model with deeper content understanding ($3-$15/1M tokens) - **Available in both servers**
- **sonar-reasoning**: Fast problem-solving with step-by-step logic ($1-$5/1M tokens) - **STDIO server only** (slow: 15-30s response time)
- **sonar-reasoning-pro**: Enhanced multi-step reasoning ($2-$8/1M tokens) - **STDIO server only** (slow: 20-45s response time)
- **sonar-deep-research**: Exhaustive research and detailed reports ($2-$8/1M+ tokens) - **STDIO server only** (very slow: 30-60s+ response time)

**Advanced Search Controls**
- **Search Modes**: `web` (default), `academic`, `sec` (SEC filings)
- **Recency Filters**: Filter by `day`, `week`, `month`, `year`
- **Search Context Size**: `low` (faster, fewer sources), `medium` (balanced), `high` (comprehensive)
- **Internal Streaming**: Enabled by default for sub-3s TTFT, transparent to clients
- **Temperature & Max Tokens**: Fine-tune response generation

**OpenAI API Compatible**
- Drop-in replacement for OpenAI Chat Completions
- Use existing OpenAI SDKs with just a base URL change
- Same message format and parameter structure
- Additional Perplexity-specific parameters for enhanced control

### Chat Completions vs Search API

**This server uses Chat Completions API** because:
- ✅ AI-generated answers synthesized from web sources
- ✅ Automatic reasoning and summarization
- ✅ Structured citations as separate resource blocks
- ✅ Performance-optimized internal streaming for sub-3s TTFT
- ✅ Multiple specialized models for different use cases
- ✅ Usage statistics and metadata in responses

**Use the Search API instead** when you need:
- Raw structured search results without AI synthesis
- Direct control over result ranking and filtering
- Batch processing of multiple search queries
- Lower-level search data for custom processing

### Performance Characteristics

- **Time to First Token (TTFT)**: ~2 seconds with internal streaming enabled (default)
- **Total Response Time**:
  - **Small responses** (3,700 chars): ~11-13 seconds
  - **Large responses** (7,700 chars): ~24-26 seconds
  - Performance scales proportionally with response size
- **Streaming Throughput**: ~37 chunks/second with optimized O(n) array-based buffering
- **Connection Pooling**: Keep-alive HTTP agent reduces latency on subsequent requests (60-120s timeout)
- **Automatic Retries**: Exponential backoff for transient failures (429, 500, 502, 503, 504)
- **Timeout Handling**: 30s default timeout with AbortController for reliable error handling
- **Citations**: Automatic source attribution with URLs
- **Context**: Up to 200k tokens context window (model dependent)

**Performance Optimizations:**
- **Array-Based Buffering**: O(n) chunk processing instead of O(n²) string concatenation
- **Smart Line Splitting**: Only processes complete lines, skipping unnecessary buffer operations
- **Diagnostic Logging**: Track chunk arrival timing, detect long gaps (>1s), monitor streaming performance
- **Auto-Scaling**: Fly.io deployment with auto-start/stop for additional machines (min 1 machine for DNS)

**Optimization Tips:**
- Use `search_context_size: 'low'` for faster responses with fewer sources
- Use `max_tokens: 512-1024` to limit response length and reduce processing time
- Default `stream: true` provides optimal TTFT (~2s connection time)
- Keep-alive connections improve latency after first request
- Automatic retries handle transient API failures transparently

Learn more at:
- [Chat Completions API Reference](https://docs.perplexity.ai/api-reference/chat-completions-post)
- [OpenAI Compatibility Guide](https://docs.perplexity.ai/guides/chat-completions-guide)
- [Streaming Guide](https://docs.perplexity.ai/guides/streaming)
- [Pricing Documentation](https://docs.perplexity.ai/getting-started/pricing)

## Project Structure

```
perplexity-completions-mcp/
├── perplexity-completions/
│   ├── dist/              # Compiled JavaScript (gitignored)
│   ├── node_modules/      # Dependencies (gitignored)
│   ├── Dockerfile         # Docker container configuration
│   ├── fly.toml           # Fly.io deployment configuration
│   ├── index.ts           # Stdio MCP server implementation
│   ├── server.ts          # HTTP MCP server implementation
│   ├── package.json       # Node.js package configuration
│   ├── pnpm-lock.yaml     # pnpm lock file for reproducible builds
│   ├── tsconfig.json      # TypeScript configuration
│   ├── .env.local         # Local environment variables (gitignored)
│   └── .env.local.example # Environment template
├── .gitignore             # Git ignore rules
├── LICENSE                # MIT License
└── README.md              # This file
```

## Development Scripts

```bash
# Build TypeScript to JavaScript
pnpm run build

# Run stdio MCP server in development mode (loads .env.local)
pnpm run dev

# Run HTTP server in development mode (loads .env.local)
pnpm run dev:server

# Run stdio MCP server in production mode
pnpm run start

# Run HTTP server in production mode
pnpm run start:server

# Watch mode for development
pnpm run watch

# Test the search functionality
node test-search.js
```

## Troubleshooting

### API Key Not Found

```
Error: PERPLEXITY_API_KEY environment variable is required
```

**Solution:** Ensure your `.env.local` file exists and contains your API key, or set it as an environment variable.

### Connection Issues

- Verify your API key is valid at [Perplexity API Settings](https://www.perplexity.ai/settings/api)
- Check your internet connection
- Ensure you have API credits available

### MCP Server Not Showing in Client

1. Restart your MCP client completely
2. Verify the configuration file path is correct
3. Check the client's developer console for errors
4. Ensure the server builds without errors (`pnpm run build`)

For additional troubleshooting, refer to:
- [MCP Debugging Guide](https://modelcontextprotocol.io/docs/tools/debugging) - General MCP debugging
- [Fly.io Logs](https://fly.io/docs/flyctl/logs/) - View application logs for deployment issues

## Security Best Practices

### API Key Management

**Never commit your API key to version control:**

```bash
# ✅ Good - .env.local is in .gitignore
PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxx

# ❌ Bad - Never commit keys directly in code
const apiKey = "pplx-xxxxxxxxxxxxx"
```

**Environment Variables:**
- Use `.env.local` for local development (automatically gitignored)
- Set environment variables directly in production environments
- Use secrets management services (AWS Secrets Manager, HashiCorp Vault, etc.) for production deployments

**Key Rotation:**
- Rotate API keys periodically
- Immediately revoke and regenerate keys if compromised
- Use separate keys for development, staging, and production environments

### MCP Client Configuration Security

When adding the API key to your MCP client configuration:

```json
{
  "mcpServers": {
    "perplexity-completions": {
      "env": {
        "PERPLEXITY_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

**Security Notes:**
- This file is stored locally on your machine
- Ensure proper file permissions (read-only for your user)
- Be cautious when sharing screenshots or debugging output
- Consider using environment variable references if your system supports it

### Production Deployment

For production environments:
- Use environment variables instead of config files
- Implement request rate limiting
- Monitor API usage for anomalies
- Set up alerts for unusual activity or quota thresholds

## Other MCP Client Integration

This server works with any MCP-compatible client. Configuration will vary by client - refer to your client's MCP integration documentation for specific setup instructions.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This MCP server is licensed under the MIT License. You are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.

## Credits

- Forked from [perplexityai/modelcontextprotocol](https://github.com/perplexityai/modelcontextprotocol)
- Powered by [Perplexity Chat Completions API](https://docs.perplexity.ai/api-reference/chat-completions-post)
- Built with [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
