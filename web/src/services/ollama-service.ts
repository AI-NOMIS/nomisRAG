export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaRequest {
  model: string;
  messages: OllamaMessage[];
  stream?: boolean;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  message: OllamaMessage;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaConfig {
  baseUrl: string;
  defaultModel: string;
  timeout: number;
}

export class OllamaService {
  private config: OllamaConfig;

  constructor(config: Partial<OllamaConfig> = {}) {
    this.config = {
      baseUrl: 'http://localhost:11434',
      defaultModel: 'llama3.2',
      timeout: 30000,
      ...config,
    };
  }

  updateConfig(config: Partial<OllamaConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig(): OllamaConfig {
    return { ...this.config };
  }

  chat(request: OllamaRequest): Promise<OllamaResponse> {
    return fetch(`${this.config.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    });
  }

  chatStream(
    request: OllamaRequest,
    onChunk: (chunk: OllamaResponse) => void,
  ): Promise<void> {
    return fetch(`${this.config.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...request, stream: true }),
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      const processText = (): Promise<void> => {
        return reader.read().then(({ done, value }) => {
          if (done) {
            return;
          }

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter((line) => line.trim());

          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              onChunk(data);
            } catch (e) {
              console.warn('Failed to parse JSON:', line);
            }
          }

          return processText();
        });
      };

      return processText();
    });
  }

  listModels(): Promise<{ models: Array<{ name: string }> }> {
    return fetch(`${this.config.baseUrl}/api/tags`).then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    });
  }

  // Health check to verify Ollama is running
  checkHealth(): Promise<boolean> {
    return fetch(`${this.config.baseUrl}/api/version`)
      .then((response) => response.ok)
      .catch(() => false);
  }
}

export const ollamaService = new OllamaService();
