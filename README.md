# Anamorphic Web Previewer 🎥

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Launch-success?style=for-the-badge)](https://tramper2.github.io/AnamophicScreen/)

**WebGL 기반 애나모픽 디스플레이 시뮬레이터**입니다. 사용자가 업로드한 동영상이 다양한 애나모픽 디스플레이 환경(L자, 원통, 구체 등)에서 어떻게 왜곡되고 시각화되는지 브라우저에서 실시간으로 미리 볼 수 있는 정적 웹 애플리케이션입니다.

## ✨ 주요 기능 (Core Features)

*   **로컬 비디오 로드**: 사용자가 보유한 로컬 비디오 파일(MP4, WebM 등)을 서버 전송 없이 브라우저에 업로드하여 즉시 테스트할 수 있습니다.
*   **다양한 디스플레이 모드**: 실시간으로 스크린 형태를 변경하며 프리뷰를 확인할 수 있습니다.
    *   **Flat (평면)**: 기본 기준 스크린
    *   **L-Shape (L자형)**: 정면 + 바닥/측면 90도 절곡 스크린
    *   **Cylinder (원통형)**: 내부 매핑 스크린
    *   **Sphere (구체형)**: 돔/구체 내부 매핑 스크린
*   **애나모픽 착시(Sweet Spot) 시뮬레이션**: 특정 시점(가상 프로젝터 시점)에서 바라볼 때만 영상이 올바른 비율로 보이도록 커스텀 셰이더를 통한 프로젝션 텍스처 매핑(Projective Texture Mapping) 기술이 적용되어 있습니다.
    *   마우스 드래그를 통해 카메라를 자유롭게 움직이며 시점에 따른 시각적 왜곡을 확인 가능합니다.
    *   지정된 '정점 보기(Reset View)' 버튼을 통해 완벽한 착시 시점으로 부드럽게 복귀합니다.
*   **100% 클라이언트 사이드 연산**: 서버 백엔드 없이 순수 사용자 브라우저(WebGL)에서 모든 비디오 처리 및 3D 렌더링이 이루어지도록 설계되어 가볍고 빠릅니다.

## 🛠 기술 스택 (Tech Stack)

*   **Language/Core**: JavaScript (ES6+), HTML5, CSS3
*   **3D Engine**: Three.js
*   **Build Tool**: Vite
*   **Deploy**: GitHub Pages

## 🚀 로컬 실행 방법 (How to Run Locally)

본 프로젝트는 `Vite` 기반으로 구성되어 있어 빠르고 가벼운 개발 환경을 제공합니다.

1. **저장소 클론 (Clone Repository)**
   ```bash
   git clone git@github.com:tramper2/AnamophicScreen.git
   cd AnamophicScreen
   ```

2. **의존성 설치 (Install Dependencies)**
   ```bash
   npm install
   ```

3. **개발 서버 실행 (Start Dev Server)**
   ```bash
   npm run dev
   ```

4. 브라우저를 열고 `http://localhost:5173` 으로 접속합니다.

## 🏗 빌드 (Build)

프로덕션용 정적 파일로 빌드하려면 아래 명령어를 사용합니다. 빌드 결과물은 `dist` 폴더에 생성됩니다.

```bash
npm run build
```

## 📝 구조 및 특징
* 비디오 소스는 `THREE.VideoTexture`를 활용하여 메모리 효율적으로 GPU에 업데이트되며, 비디오 변경 시 완벽한 가비지 컬렉션(Garbage Collection) 처리를 통해 메모리 누수를 방지합니다.
* 투사 프로젝션은 Custom Shader(Vertex & Fragment Shader)를 통해 구현되어 안정적인 렌더링을 보장합니다.
