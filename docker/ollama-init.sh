#!/bin/bash

# Ollama 초기화 스크립트
set -e

echo "🚀 Starting Ollama server..."

# Ollama 서버를 백그라운드에서 시작
ollama serve &

# Ollama 서버가 시작될 때까지 대기
echo "⏳ Waiting for Ollama server to be ready..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -f http://localhost:11434/api/tags >/dev/null 2>&1; then
        echo "✅ Ollama server is ready!"
        break
    fi
    echo "   Attempt $((attempt + 1))/$max_attempts - waiting..."
    sleep 2
    attempt=$((attempt + 1))
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ Failed to start Ollama server after $max_attempts attempts"
    exit 1
fi

# qwen3:14b 모델이 이미 존재하는지 확인
echo "🔍 Checking if qwen3:14b model exists..."
if ollama list | grep -q "qwen3:14b"; then
    echo "✅ qwen3:14b model already exists!"
else
    echo "📥 Downloading qwen3:14b model... (This may take a while)"
    if ollama pull qwen3:14b; then
        echo "✅ qwen3:14b model downloaded successfully!"
    else
        echo "❌ Failed to download qwen3:14b model"
        exit 1
    fi
fi

# 모델이 정상적으로 로드되었는지 확인
echo "🧪 Testing qwen3:14b model..."
if echo "Hello" | ollama run qwen3:14b --verbose >/dev/null 2>&1; then
    echo "✅ qwen3:14b model is working correctly!"
else
    echo "⚠️  Model test failed, but continuing..."
fi

echo "🎉 Ollama initialization completed!"
echo "📊 Available models:"
ollama list

# 포그라운드에서 대기하여 컨테이너가 종료되지 않도록 함
wait