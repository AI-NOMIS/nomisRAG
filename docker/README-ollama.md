# 🤖 RAGFlow + Ollama 통합 가이드

이 문서는 RAGFlow에 Ollama를 통합하여 로컬 LLM 모델을 사용하는 방법을 설명합니다.

## 🚀 개요

RAGFlow Docker Compose 설정에 **Ollama**가 통합되어 있어, **qwen3:14b** 모델을 자동으로 다운로드하고 GPU에서 실행할 수 있습니다.

## 📋 사전 요구사항

### 하드웨어 요구사항
- **GPU**: NVIDIA GPU (CUDA 지원)
- **VRAM**: 최소 16GB 권장 (qwen3:14b 모델용)
- **RAM**: 최소 32GB 권장
- **디스크**: 최소 20GB 여유 공간 (모델 다운로드용)

### 소프트웨어 요구사항
- Docker Engine >= 24.0.0
- Docker Compose >= v2.26.1
- NVIDIA Container Toolkit (GPU 지원용)

## 🛠️ 설치 및 설정

### 1. NVIDIA Container Toolkit 설치

#### Ubuntu/Debian
```bash
# NVIDIA Container Toolkit 설치
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
  sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
  sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit

# Docker 재시작
sudo systemctl restart docker
```

### 2. RAGFlow + Ollama 실행

#### CPU + GPU 환경 (권장)
```bash
# GPU 버전으로 실행
docker compose -f docker-compose-gpu.yml up -d
```

#### CPU 전용 환경
```bash
# 일반 버전으로 실행 (GPU 설정은 무시됨)
docker compose -f docker-compose.yml up -d
```

## 📊 서비스 모니터링

### 1. Ollama 서비스 상태 확인
```bash
# 컨테이너 로그 확인
docker logs ragflow-ollama

# 서비스 상태 확인
docker compose ps
```

### 2. 모델 다운로드 진행상황 확인
```bash
# 실시간 로그 모니터링
docker logs -f ragflow-ollama
```

예상 로그 출력:
```
🚀 Starting Ollama server...
⏳ Waiting for Ollama server to be ready...
✅ Ollama server is ready!
🔍 Checking if qwen3:14b model exists...
📥 Downloading qwen3:14b model... (This may take a while)
✅ qwen3:14b model downloaded successfully!
🧪 Testing qwen3:14b model...
✅ qwen3:14b model is working correctly!
🎉 Ollama initialization completed!
📊 Available models:
```

## 🔧 설정 커스터마이징

### 환경변수 설정

`.env` 파일 또는 환경변수로 다음 값들을 수정할 수 있습니다:

```bash
# Ollama 포트 (기본값: 11434)
OLLAMA_PORT=11434

# 타임존 설정
TIMEZONE=Asia/Seoul
```

### 다른 모델 사용하기

`docker/ollama-init.sh` 파일을 수정하여 다른 모델을 사용할 수 있습니다:

```bash
# qwen3:14b 대신 다른 모델 사용
ollama pull llama3.1:8b
# 또는
ollama pull codellama:7b
```

## 🌐 RAGFlow에서 Ollama 사용하기

### 1. Ollama 연결 설정

RAGFlow 웹 인터페이스에서:
1. **Settings** → **Model Configuration** 이동
2. **Add LLM** 클릭
3. 다음 정보 입력:
   - **Factory**: `Ollama`
   - **Base URL**: `http://ollama:11434`
   - **Model Name**: `qwen3:14b`

### 2. API 직접 접근

```bash
# 모델 목록 확인
curl http://localhost:11434/api/tags

# 테스트 요청
curl http://localhost:11434/api/generate -d '{
  "model": "qwen3:14b",
  "prompt": "Hello, how are you?"
}'
```

## 🚨 문제 해결

### 일반적인 문제들

#### 1. GPU 인식 안됨
```bash
# NVIDIA 드라이버 확인
nvidia-smi

# Docker에서 GPU 접근 확인
docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi
```

#### 2. 모델 다운로드 실패
```bash
# 컨테이너 내부에서 수동 다운로드
docker exec -it ragflow-ollama ollama pull qwen3:14b
```

#### 3. 메모리 부족
- Docker Desktop의 메모리 제한 증가
- 시스템 메모리 확인 및 확보

#### 4. 네트워크 연결 문제
```bash
# Ollama 서비스 연결 테스트
docker exec ragflow-server curl http://ollama:11434/api/tags
```

### 로그 분석

```bash
# 전체 서비스 로그
docker compose logs

# Ollama 전용 로그
docker compose logs ollama

# RAGFlow 서버 로그
docker compose logs ragflow
```

## 📈 성능 최적화

### 1. GPU 메모리 최적화
```bash
# GPU 메모리 사용량 모니터링
watch -n 1 nvidia-smi
```

### 2. 모델 캐시 관리
```bash
# 모델 목록 확인
docker exec ragflow-ollama ollama list

# 불필요한 모델 삭제
docker exec ragflow-ollama ollama rm <model_name>
```

## 🔄 업데이트 및 유지보수

### 모델 업데이트
```bash
# 최신 모델로 업데이트
docker exec ragflow-ollama ollama pull qwen3:14b

# 컨테이너 재시작
docker compose restart ollama
```

### 데이터 백업
```bash
# Ollama 데이터 백업
docker run --rm -v ragflow_ollama_data:/data -v $(pwd):/backup ubuntu tar czf /backup/ollama_backup.tar.gz /data
```

## 📚 추가 리소스

- [Ollama 공식 문서](https://ollama.ai/)
- [qwen3 모델 정보](https://ollama.ai/library/qwen2.5)
- [RAGFlow 문서](https://ragflow.io/docs/)
- [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html)