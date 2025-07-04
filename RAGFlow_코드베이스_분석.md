# RAGFlow 코드베이스 분석 스크래치 패드

## 🎯 프로젝트 개요

**RAGFlow**는 깊은 문서 이해를 기반으로 한 오픈소스 RAG (Retrieval-Augmented Generation) 엔진입니다.

### 핵심 정보
- **버전**: 0.19.1
- **언어**: Python 3.10-3.13
- **라이센스**: Apache 2.0
- **개발사**: InfiniFlow

### 주요 기능
- 복잡한 형식의 비정형 데이터에서 지식 추출
- 템플릿 기반 청킹 시스템
- 여러 데이터 소스 지원 (Word, PDF, Excel, 이미지 등)
- 인용이 포함된 답변 생성으로 할루시네이션 감소
- 다양한 LLM 및 임베딩 모델 지원

---

## 🏗️ 시스템 아키텍처

### 주요 컴포넌트

#### 1. **API 서버** (`api/`)
- **메인 서버**: `ragflow_server.py`
- **설정 관리**: `settings.py`
- **애플리케이션 모듈들**: `apps/`
  - `api_app.py`: 메인 API 엔드포인트
  - `document_app.py`: 문서 관리
  - `kb_app.py`: 지식베이스 관리
  - `conversation_app.py`: 대화 관리
  - `canvas_app.py`: 캔버스 기능
  - `llm_app.py`: LLM 관리
  - `mcp_server_app.py`: MCP 서버 관리

#### 2. **RAG 엔진** (`rag/`)
- **프롬프트 관리**: `prompts.py` (489줄)
- **LLM 모델들**: `llm/`
  - `chat_model.py`: 채팅 모델 (1675줄)
  - `embedding_model.py`: 임베딩 모델 (881줄)
  - `rerank_model.py`: 재순위 모델 (624줄)
  - `cv_model.py`: 컴퓨터 비전 모델 (1233줄)
- **검색 서비스**: `svr/`
- **벤치마크**: `benchmark.py`

#### 3. **문서 처리** (`deepdoc/`)
- **파서들**: `parser/`
  - `pdf_parser.py`: PDF 파서 (1328줄)
  - `docx_parser.py`: DOCX 파서
  - `excel_parser.py`: Excel 파서
  - `ppt_parser.py`: PowerPoint 파서
  - `html_parser.py`: HTML 파서
  - `markdown_parser.py`: Markdown 파서
- **비전 처리**: `vision/`

#### 4. **에이전트 시스템** (`agent/`)
- **메인 캔버스**: `canvas.py` (380줄)
- **컴포넌트들**: `component/`
  - `retrieval.py`: 검색 컴포넌트
  - `generate.py`: 생성 컴포넌트
  - `rewrite.py`: 재작성 컴포넌트
  - `code.py`: 코드 실행 컴포넌트
  - `email.py`: 이메일 컴포넌트
  - `google.py`, `bing.py`: 검색 컴포넌트

#### 5. **GraphRAG** (`graphrag/`)
- **엔티티 해결**: `entity_resolution.py`
- **검색 기능**: `search.py`
- **유틸리티**: `utils.py`

#### 6. **웹 프론트엔드** (`web/`)
- **프레임워크**: React + TypeScript + Umi
- **UI 라이브러리**: Ant Design + Radix UI
- **상태 관리**: Zustand
- **스타일링**: Tailwind CSS

---

## 🔧 기술 스택

### 백엔드
- **웹 프레임워크**: Flask
- **데이터베이스**: MySQL/PostgreSQL
- **문서 저장소**: Elasticsearch/Infinity/OpenSearch
- **캐시**: Redis
- **파일 저장소**: MinIO
- **컨테이너**: Docker

### 프론트엔드
- **메인 프레임워크**: React 18 + TypeScript
- **빌드 도구**: Umi 4
- **UI 컴포넌트**: Ant Design 5, Radix UI
- **상태 관리**: Zustand
- **스타일링**: Tailwind CSS
- **차트**: Recharts, G2, G6

### AI/ML
- **LLM 지원**: OpenAI, Anthropic, Cohere, Mistral, Ollama 등
- **임베딩**: BGE, BCE, FastEmbed
- **컴퓨터 비전**: OpenCV, PIL
- **추론**: ONNX Runtime

---

## 📁 주요 디렉토리 구조

```
ragflow/
├── api/                    # API 서버
│   ├── apps/              # 애플리케이션 모듈
│   ├── db/                # 데이터베이스 관련
│   ├── utils/             # 유틸리티
│   └── ragflow_server.py  # 메인 서버
├── rag/                   # RAG 엔진
│   ├── llm/               # LLM 모델들
│   ├── nlp/               # NLP 유틸리티
│   ├── svr/               # 서비스 로직
│   └── prompts.py         # 프롬프트 관리
├── deepdoc/               # 문서 처리
│   ├── parser/            # 파일 파서들
│   └── vision/            # 비전 처리
├── agent/                 # 에이전트 시스템
│   ├── component/         # 에이전트 컴포넌트
│   └── canvas.py          # 에이전트 캔버스
├── graphrag/              # 그래프 RAG
├── web/                   # 웹 프론트엔드
│   └── src/               # 소스 코드
├── docker/                # Docker 설정
├── conf/                  # 설정 파일
├── sdk/                   # SDK
└── test/                  # 테스트
```

---

## 🚀 핵심 기능 분석

### 1. **문서 처리 파이프라인**
- **지원 형식**: PDF, DOCX, PPTX, XLSX, HTML, Markdown, 이미지
- **OCR 지원**: 스캔된 문서 처리
- **레이아웃 분석**: 문서 구조 이해
- **청킹 전략**: 템플릿 기반 인텔리전트 청킹

### 2. **검색 시스템**
- **벡터 검색**: 의미론적 유사성 검색
- **키워드 검색**: 전문 검색 엔진 기반
- **하이브리드 검색**: 벡터 + 키워드 조합
- **재순위화**: 검색 결과 최적화

### 3. **LLM 통합**
- **다중 제공업체 지원**: OpenAI, Anthropic, Cohere, Mistral 등
- **모델 관리**: 동적 모델 선택 및 설정
- **프롬프트 엔지니어링**: 체계적인 프롬프트 관리
- **인용 생성**: 답변에 출처 표시

### 4. **에이전트 시스템**
- **워크플로우 관리**: 캔버스 기반 에이전트 설계
- **컴포넌트 시스템**: 재사용 가능한 기능 모듈
- **도구 통합**: 검색, 코드 실행, 이메일 등

---

## 🛠️ 설정 및 배포

### Docker 구성 (`docker-compose.yml`)
```yaml
services:
  ragflow:
    image: ${RAGFLOW_IMAGE}
    ports:
      - ${SVR_HTTP_PORT}:9380
      - 80:80
    depends_on:
      - mysql
      - elasticsearch/infinity
      - redis
      - minio
```

### 주요 설정 파일
- **환경 변수**: `docker/.env`
- **서비스 설정**: `docker/service_conf.yaml.template`
- **Python 설정**: `pyproject.toml`

### 데이터 스토리지
- **문서 엔진**: Elasticsearch(기본)/Infinity/OpenSearch
- **관계형 DB**: MySQL/PostgreSQL
- **파일 저장소**: MinIO
- **캐시**: Redis

---

## 🔍 주요 API 엔드포인트

### 문서 관리
- `POST /v1/documents/upload`: 문서 업로드
- `GET /v1/documents/{id}`: 문서 조회
- `DELETE /v1/documents/{id}`: 문서 삭제

### 지식베이스 관리
- `POST /v1/datasets`: 데이터셋 생성
- `GET /v1/datasets`: 데이터셋 목록
- `POST /v1/datasets/{id}/documents`: 문서 추가

### 대화 관리
- `POST /v1/chats`: 대화 생성
- `POST /v1/chats/{id}/completions`: 대화 완료
- `GET /v1/chats/{id}/messages`: 메시지 목록

---

## 📊 성능 및 확장성

### 성능 최적화
- **벡터 인덱싱**: 고속 유사성 검색
- **캐싱**: Redis 기반 결과 캐싱
- **비동기 처리**: 문서 처리 백그라운드 작업
- **배치 처리**: 대량 문서 처리

### 확장성 고려사항
- **마이크로서비스**: 각 컴포넌트 독립 배포 가능
- **로드 밸런싱**: 다중 인스턴스 지원
- **데이터 파티셔닝**: 대용량 데이터 처리

---

## 🔐 보안 기능

### 인증 및 권한
- **JWT 토큰**: 세션 관리
- **OAuth 지원**: GitHub, Feishu 연동
- **API 키 관리**: 외부 서비스 보안

### 데이터 보호
- **데이터 암호화**: 저장 데이터 암호화
- **접근 제어**: 테넌트 기반 격리
- **감사 로깅**: 활동 추적

---

## 🧪 테스트 및 개발

### 테스트 구조
- **단위 테스트**: pytest 기반
- **통합 테스트**: API 엔드포인트 테스트
- **성능 테스트**: 벤치마크 도구

### 개발 환경 설정
```bash
# 의존성 설치
uv sync --python 3.10 --all-extras

# 개발 서버 실행
bash docker/launch_backend_service.sh

# 프론트엔드 개발 서버
cd web && npm run dev
```

---

## 📈 향후 개발 계획

### 최근 업데이트 (2025년)
- Python/JavaScript 코드 실행 컴포넌트 추가
- 다국어 쿼리 지원
- 멀티모달 모델 지원 (PDF/DOCX 내 이미지 처리)
- 인터넷 검색 통합 (Tavily)
- 문서 레이아웃 분석 모델 업그레이드

### 로드맵
- 더 많은 데이터 소스 지원
- 향상된 그래프 RAG 기능
- 더 나은 성능 최적화
- 추가 LLM 제공업체 지원

---

## 🛡️ 주의사항 및 제한사항

### 시스템 요구사항
- **CPU**: 4코어 이상
- **RAM**: 16GB 이상
- **디스크**: 50GB 이상
- **Docker**: 24.0.0 이상

### 알려진 제한사항
- ARM64 플랫폼 Docker 이미지 미지원
- 일부 LLM 모델 제한
- 대용량 파일 처리 시 메모리 사용량 증가

---

## 🔧 커스터마이징 포인트

### 1. **새로운 파서 추가**
- `deepdoc/parser/` 디렉토리에 새 파서 구현
- `__init__.py`에 파서 등록

### 2. **LLM 모델 통합**
- `rag/llm/chat_model.py`에 새 모델 클래스 추가
- 설정 파일에 모델 정보 추가

### 3. **에이전트 컴포넌트 개발**
- `agent/component/`에 새 컴포넌트 구현
- `base.py`의 기본 클래스 상속

### 4. **프론트엔드 확장**
- `web/src/pages/`에 새 페이지 추가
- `web/src/components/`에 재사용 컴포넌트 개발

---

## 📚 참고 자료

### 공식 문서
- [RAGFlow 공식 문서](https://ragflow.io/docs/dev/)
- [GitHub 저장소](https://github.com/infiniflow/ragflow)
- [데모 사이트](https://demo.ragflow.io)

### 커뮤니티
- [Discord](https://discord.gg/NjYzJD3GM3)
- [Twitter](https://twitter.com/infiniflowai)
- [GitHub Discussions](https://github.com/orgs/infiniflow/discussions)

---

*이 문서는 RAGFlow v0.19.1 기준으로 작성되었습니다. 최신 정보는 공식 문서를 참조하시기 바랍니다.*