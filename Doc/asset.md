# Asset & Directory Structure Specifications

## 1. 디렉토리 구조 (Directory Structure)
코딩 에이전트가 파일 시스템을 직관적으로 이해할 수 있도록 아래 구조를 유지합니다.

```
anamorphic-previewer/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages 배포를 위한 CI/CD 액션
├── public/
│   └── assets/
│     └── sample_video.mp4     # 초기에 로드될 가볍고 대조군이 확실한 샘플 영상 (10MB 이하)
├── src/
│   ├── assets/
│   │   └── styles.css          # 기본 UI 레이아웃 및 테마 스타일
│   ├── components/
│   │   ├── CanvasView.js       # Three.js 씬 생성, 렌더 루프 및 카메라 제어
│   │   ├── ControlPanel.js     # 스크린 변경 및 슬라이더 기즈모 UI
│   │   └── VideoLoader.js      # 파일 업로드 핸들러 및 텍스처 변환 관리
│   ├── shaders/
│   │   ├── anamorphic.vert     # 투사 좌표 계산 커스텀 버텍스 셰이더
│   │   └── anamorphic.frag     # 비디오 매핑 및 외곽선 처리 프래그먼트 셰이더
│   ├── App.js                  # 전역 상태 관리 및 레이아웃 조립
│   └── main.js                 # 엔트리 포인트
├── index.html                  # 메인 HTML5 구조
├── package.json
└── vite.config.js              # 정적 배포 베이스 경로 설정을 포함한 Vite 환경 파일
```

## 2. 필요 에셋 명세 (Required Assets)
- **기본 샘플 동영상:** 애나모픽 효과를 극명하게 테스트할 수 있는 기하학적 패턴(예: 체크보드, 큐브 회전, 그리드라인 패턴)이 포함된 1920x1080 해상도의 10~15초 루프 MP4 파일.
- **아이콘 및 UI 에셋:** 각 디스플레이 모드(평면, L자, 원통, 구형)를 직관적으로 표현하는 간결한 SVG 아이콘셋 또는 텍스트 UI 처리.