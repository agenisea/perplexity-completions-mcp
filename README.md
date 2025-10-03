# Perplexity Chat Completions MCP Server

An MCP server implementation that integrates the Perplexity Chat Completions API to provide AI agents with AI-powered web search and real-time knowledge with **SSE streaming support**.

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

This MCP (Model Context Protocol) server provides AI-powered web search using Perplexity's **Chat Completions API** with **SSE (Server-Sent Events) streaming support**. Unlike traditional search APIs, this returns AI-generated answers with real-time web research and source citations.

The Chat Completions API combines:
- 🤖 **AI-Generated Answers**: Natural language responses powered by Perplexity's Sonar models
- 🌐 **Real-Time Web Search**: Up-to-date information from across the internet
- 📚 **Source Citations**: Every answer includes references with URLs
- ⚡ **SSE Streaming**: Optional token-by-token streaming for real-time responses

## Why This MCP Server?

**Give AI Agents Powerful Research Capabilities**: Instead of just returning search results, Perplexity's AI analyzes the web and generates comprehensive answers with citations - giving AI agents access to real-time knowledge.

**Key Benefits:**
- 🎯 **AI-Generated Answers**: Get synthesized insights with web research, not just raw search results
- 🔗 **Automatic Citations**: Every response includes source URLs for verification
- ⚡ **SSE Streaming**: Enable real-time token-by-token responses (optional)
- 🎚️ **Flexible Models**: Choose from 5 Sonar models including reasoning and deep research
- 🔍 **Advanced Filters**: Filter by recency (day/week/month/year), search mode (web/academic/sec)
- ⚡ **Cost-Effective**: Starting at $1/1M tokens with the base `sonar` model
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

- **[Perplexity Chat Completions API](https://docs.perplexity.ai)**: AI-powered web search with SSE streaming
  - [Chat Completions Guide](https://docs.perplexity.ai/guides/chat-completions) - Implementation guide
  - [Streaming Guide](https://docs.perplexity.ai/guides/streaming) - SSE streaming documentation
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
- ⚡ **SSE Streaming**: Optional real-time token-by-token response streaming
- 🔍 **Real-Time Web Search**: Access current information with automatic web research
- 📚 **Automatic Citations**: Every answer includes source URLs and references
- 🎚️ **Multiple Models**: Choose from `sonar`, `sonar-pro`, or `sonar-reasoning`
- 🔍 **Advanced Filters**:
  - Recency: Filter by `day`, `week`, `month`, `year`
  - Domain: Search `web`, `academic`, or `sec` filings
- 🎯 **Configurable Parameters**: Control temperature, max tokens, and more
- 🔒 **Type-Safe Implementation**: Full TypeScript support with strict typing

## Tools

### perplexity-completions

Performs AI-powered web search using Perplexity's Chat Completions API with optional SSE streaming.

**Inputs:**
- `query` (string, required): Search query or question to ask Perplexity AI
- `model` (string, optional): Model to use - `sonar` (default), `sonar-pro`, `sonar-deep-research`, `sonar-reasoning`, `sonar-reasoning-pro`
- `stream` (boolean, optional): Enable SSE streaming for real-time token-by-token responses (default: false)
- `search_mode` (string, optional): Search mode - `web` (default), `academic`, `sec`
- `recency_filter` (string, optional): Filter by time - `day`, `week`, `month`, `year`
- `reasoning_effort` (string, optional): Computational effort for deep research - `low`, `medium`, `high` (only for sonar-deep-research)
- `max_tokens` (number, optional): Maximum tokens in response (1-4096, default: 1024)
- `temperature` (number, optional): Sampling temperature 0-2 (default: 0.7)

**Output:**
AI-generated answer with citations including:
- Natural language response synthesized from web sources
- Source citations with titles and URLs
- Formatted markdown with sections

**Example (Non-streaming):**
```json
{
  "query": "What are the latest developments in AI?",
  "model": "sonar-pro",
  "recency_filter": "week"
}
```

**Example (SSE Streaming):**
```json
{
  "query": "What are the latest developments in AI?",
  "model": "sonar-pro",
  "stream": true,
  "recency_filter": "week"
}
```

## SSE Streaming Support

The server supports **Server-Sent Events (SSE)** streaming for real-time token-by-token responses from Perplexity AI. This enables LLM clients to display progressive responses as they are generated.

### How It Works

When `stream: true` is set in the tool arguments, the server:

1. **Receives streaming data** from Perplexity Chat Completions API
2. **Pipes SSE events** directly to the MCP client in real-time
3. **Sends structured events** with content chunks and citations
4. **Completes with [DONE]** signal when streaming finishes

### SSE Event Format

The server sends structured SSE events in JSON format:

**Content Event (streamed tokens):**
```
data: {"type":"content","content":"AI has seen "}
data: {"type":"content","content":"significant "}
data: {"type":"content","content":"progress..."}
```

**Citations Event (at completion):**
```
data: {"type":"citations","content":"\n\n## Sources\n\n1. **Article Title**\n   https://example.com\n"}
```

**Completion Signal:**
```
data: [DONE]
```

**Error Event (if errors occur):**
```
data: {"type":"error","content":"Error message"}
```

### Client Integration

**Making a streaming request:**

```javascript
const response = await fetch('http://localhost:8080/mcp/call', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa('username:password')
  },
  body: JSON.stringify({
    name: 'perplexity-completions',
    arguments: {
      query: 'What are the latest AI developments?',
      model: 'sonar',
      stream: true
    }
  })
});

// Process SSE stream
const reader = response.body.getReader();
const decoder = new TextDecoder();
let buffer = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);

      if (data === '[DONE]') {
        console.log('Stream complete');
        break;
      }

      const event = JSON.parse(data);

      if (event.type === 'content') {
        process.stdout.write(event.content); // Display token
      } else if (event.type === 'citations') {
        console.log(event.content); // Display sources
      } else if (event.type === 'error') {
        console.error('Error:', event.content);
      }
    }
  }
}
```

### Testing SSE Streaming

Test the streaming functionality with the included test script:

```bash
# Set environment variables
export PERPLEXITY_API_KEY=your_api_key
export MCP_USER=your_username
export MCP_PASS=your_password

# Run the test
node test-sse-stream.js
```

### Performance Benefits

**Real-time feedback:**
- ✅ Immediate response display (no wait for full completion)
- ✅ Better user experience with progressive loading
- ✅ Lower perceived latency

**Efficient resource usage:**
- ✅ No buffering of large responses in memory
- ✅ Backpressure handling with stream flow control
- ✅ Graceful connection management

**Production considerations:**
- ⚠️ Requires persistent HTTP connection (keep-alive)
- ⚠️ Client must handle SSE parsing correctly
- ⚠️ Network interruptions require reconnection logic

### Non-streaming Mode

If `stream: false` or `stream` is omitted, the server returns a complete JSON response:

```json
{
  "content": [
    {
      "type": "text",
      "text": "AI has seen significant progress...\n\n## Sources\n\n1. **Article**\n   https://example.com"
    }
  ],
  "isError": false
}
```

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
# Deploy to Fly.io (private internal configuration)
fly deploy

# Set environment variables
fly secrets set PERPLEXITY_API_KEY=your_api_key_here
fly secrets set MCP_USER=your_username
fly secrets set MCP_PASS=your_password
```

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

```javascript
{
  "query": "artificial intelligence",
  "max_results": 5,
  "max_tokens_per_page": 2048,
  "country": "US"
}
```

For multi-query searches:

```javascript
{
  "query": ["AI trends 2024", "machine learning applications", "neural networks"],
  "max_results": 10
}
```

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
- **sonar**: Lightweight, cost-effective model for quick searches ($1/1M tokens)
- **sonar-pro**: Advanced model with deeper content understanding ($3-$15/1M tokens)
- **sonar-reasoning**: Fast problem-solving with step-by-step logic ($1-$5/1M tokens)
- **sonar-reasoning-pro**: Enhanced multi-step reasoning ($2-$8/1M tokens)
- **sonar-deep-research**: Exhaustive research and detailed reports ($2-$8/1M+ tokens)

**Advanced Search Controls**
- **Search Modes**: `web` (default), `academic`, `sec` (SEC filings)
- **Recency Filters**: Filter by `day`, `week`, `month`, `year`
- **Reasoning Effort**: Control computational depth for deep research models
- **SSE Streaming**: Optional token-by-token response streaming
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
- ✅ Built-in citation and source tracking
- ✅ SSE streaming support for real-time responses
- ✅ Multiple specialized models for different use cases

**Use the Search API instead** when you need:
- Raw structured search results without AI synthesis
- Direct control over result ranking and filtering
- Batch processing of multiple search queries
- Lower-level search data for custom processing

### Performance Characteristics

- **Latency**: 2-5 seconds for standard queries (varies by model)
- **Streaming**: Real-time token delivery with SSE
- **Citations**: Automatic source attribution with URLs
- **Context**: Up to 200k tokens context window (model dependent)

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
