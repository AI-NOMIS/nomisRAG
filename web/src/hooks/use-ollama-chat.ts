import {
  OllamaMessage,
  OllamaResponse,
  ollamaService,
} from '@/services/ollama-service';
import { useCallback, useEffect, useState } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface UseOllamaChatProps {
  model?: string;
  systemPrompt?: string;
}

export const useOllamaChat = ({
  model = 'llama3.2',
  systemPrompt,
}: UseOllamaChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  const loadModels = useCallback(async () => {
    try {
      const response = await ollamaService.listModels();
      setAvailableModels(response.models.map((m) => m.name));
    } catch (err) {
      console.error('Failed to load models:', err);
    }
  }, []);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        const ollamaMessages: OllamaMessage[] = [];

        if (systemPrompt) {
          ollamaMessages.push({
            role: 'system',
            content: systemPrompt,
          });
        }

        [...messages, userMessage].forEach((msg) => {
          ollamaMessages.push({
            role: msg.role,
            content: msg.content,
          });
        });

        await ollamaService.chatStream(
          {
            model,
            messages: ollamaMessages,
          },
          (chunk: OllamaResponse) => {
            if (chunk.message?.content) {
              setMessages((prev) => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                  return [
                    ...prev.slice(0, -1),
                    {
                      ...lastMessage,
                      content: lastMessage.content + chunk.message.content,
                    },
                  ];
                }
                return prev;
              });
            }
          },
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    },
    [messages, model, systemPrompt],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const deleteMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    deleteMessage,
    availableModels,
  };
};
