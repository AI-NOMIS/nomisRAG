# RAGFlow Ollama Integration

## Overview

This integration adds Ollama API support to RAGFlow's frontend, enabling users to chat with local AI models through Ollama as the default chatbot option.

## Features

- **Default Ollama Dialog**: A pre-configured "Ollama Chatbot" dialog appears as the first option in the chat interface
- **Streaming Support**: Real-time message streaming from Ollama models
- **Model Selection**: Configurable model selection (default: llama3.2)
- **Error Handling**: Robust error handling with user-friendly error messages
- **Health Check**: Built-in health check to verify Ollama connection

## Setup Instructions

### 1. Install Ollama

First, install Ollama on your system:

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# Download from https://ollama.com/download
```

### 2. Start Ollama Service

```bash
ollama serve
```

### 3. Pull a Model

```bash
# Pull the default model
ollama pull llama3.2

# Or pull other models
ollama pull llama2
ollama pull codellama
ollama pull mistral
```

### 4. Configure Ollama Service (Optional)

The default configuration uses:
- Base URL: `http://localhost:11434`
- Default Model: `llama3.2`
- Timeout: 30000ms

To modify these settings, update the `ollamaService` configuration in `/web/src/services/ollama-service.ts`.

## Usage

1. **Start the RAGFlow Frontend**:
   ```bash
   cd web
   npm run dev
   ```

2. **Select Ollama Dialog**:
   - The "Ollama Chatbot" dialog will appear as the first option
   - Click on it to activate Ollama mode

3. **Start Chatting**:
   - Type your messages in the chat input
   - Messages will be processed by your local Ollama instance
   - Responses will stream in real-time

## Technical Implementation

### Architecture

The integration consists of several key components:

1. **OllamaService** (`/web/src/services/ollama-service.ts`):
   - Handles API communication with Ollama
   - Supports both regular and streaming chat
   - Includes model management and health checks

2. **Chat Hooks** (`/web/src/pages/chat/hooks.ts`):
   - Modified `useSendNextMessage` to detect Ollama mode
   - Implements Ollama-specific message handling
   - Maintains compatibility with existing RAG functionality

3. **Chat Interface** (`/web/src/pages/chat/index.tsx`):
   - Adds default Ollama dialog to the dialog list
   - Auto-selects Ollama when no dialog is chosen

### Message Flow

1. User types message in chat input
2. System checks if current dialog is Ollama-based
3. If Ollama mode:
   - Converts message history to Ollama format
   - Sends request to local Ollama instance
   - Streams response back to UI
4. If regular mode:
   - Uses existing RAGFlow API flow

### Error Handling

The integration includes comprehensive error handling:

- **Connection Errors**: Displays user-friendly messages when Ollama is not running
- **Model Errors**: Handles cases where requested model is not available
- **Streaming Errors**: Gracefully handles interrupted streams
- **JSON Parse Errors**: Skips malformed chunks during streaming

## Configuration

### Default Settings

```typescript
const defaultConfig: OllamaConfig = {
  baseUrl: 'http://localhost:11434',
  defaultModel: 'llama3.2',
  timeout: 30000,
};
```

### Customization

To customize the Ollama integration:

1. **Change Default Model**:
   ```typescript
   ollamaService.updateConfig({
     defaultModel: 'llama2'
   });
   ```

2. **Use Remote Ollama Instance**:
   ```typescript
   ollamaService.updateConfig({
     baseUrl: 'http://your-ollama-server:11434'
   });
   ```

3. **Modify Dialog Settings**:
   Edit the `ollamaDialog` object in `/web/src/pages/chat/index.tsx`

## Troubleshooting

### Common Issues

1. **"Connection Error" Messages**:
   - Verify Ollama is running: `ollama serve`
   - Check if the service is accessible: `curl http://localhost:11434/api/version`

2. **Model Not Found**:
   - Pull the required model: `ollama pull llama3.2`
   - List available models: `ollama list`

3. **Slow Responses**:
   - Ensure sufficient system resources
   - Consider using a smaller model (e.g., `llama2` instead of `llama3.2`)

4. **CORS Issues**:
   - Ollama runs on localhost by default, which should not have CORS issues
   - If using a remote instance, ensure proper CORS configuration

### Debug Mode

Enable debug logging by adding this to your browser console:

```javascript
// Enable debug logs
localStorage.setItem('debug', 'ollama:*');
```

## Compatibility

- **RAGFlow Versions**: Compatible with current RAGFlow frontend
- **Ollama Versions**: Tested with Ollama 0.1.x
- **Browsers**: Chrome, Firefox, Safari, Edge
- **Operating Systems**: macOS, Linux, Windows

## Future Enhancements

Potential improvements for future versions:

1. **Model Selection UI**: Add dropdown for real-time model switching
2. **Advanced Configuration**: UI for configuring Ollama settings
3. **Multiple Instances**: Support for multiple Ollama instances
4. **Model Management**: Built-in model downloading and management
5. **Performance Metrics**: Display response times and token usage

## API Reference

### OllamaService Methods

- `chat(request: OllamaRequest): Promise<OllamaResponse>`
- `chatStream(request: OllamaRequest, onChunk: Function): Promise<void>`
- `listModels(): Promise<{models: Array<{name: string}>}>`
- `checkHealth(): Promise<boolean>`
- `updateConfig(config: Partial<OllamaConfig>): void`
- `getConfig(): OllamaConfig`

### Interfaces

```typescript
interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OllamaRequest {
  model: string;
  messages: OllamaMessage[];
  stream?: boolean;
}

interface OllamaConfig {
  baseUrl: string;
  defaultModel: string;
  timeout: number;
}
```

## Contributing

When contributing to the Ollama integration:

1. Maintain compatibility with existing RAGFlow features
2. Follow existing code patterns and TypeScript conventions
3. Add appropriate error handling and logging
4. Test with multiple Ollama models
5. Update documentation for any changes

## License

This integration follows the same license as the RAGFlow project.