## 1. 기술 스택 (Technical Stack)
- **Language/Runtime:** JavaScript (ES6+) 또는 TypeScript, HTML5, CSS3
- **3D Engine:** Three.js (최신 안정 버전)
- **Camera Control:** Three.js `OrbitControls`
- **UI Framework:** Vanilla JS 또는 React / Vue (상태 관리 및 컴포넌트 렌더링)
- **GUI Control Panel:** lil-gui 또는 dat.gui (실시간 파라미터 튜닝용)
- **Build & CI/CD:** Vite (빠른 번들링), GitHub Actions (gh-pages 자동 배포)

## 2. 핵심 기술적 당면 과제 및 해결 방안
### A. 클라이언트 사이드 비디오 텍스처링
- 사용자 비디오는 `URL.createObjectURL(file)`을 생성하여 HTML5 `<video>` 태그의 `src`로 주입.
- Three.js의 `THREE.VideoTexture(videoElement)`를 활용하여 매 프레임마다 GPU 텍스처 갱신.
- 비디오 자원 해제 시 `texture.dispose()`, `URL.revokeObjectURL()`을 통해 메모리 누수 방지.

### B. 애나모픽 투사 알고리즘 (Projective Texture Mapping)
- 단순히 UV 좌표에 맞게 영상을 입히는 것을 넘어, 특정 시점(Projector Position)에서 메쉬를 향해 레이저를 쏘듯 텍스처를 투사해야 함.
- **Custom Shader(Vertex & Fragment Shader) 구현:**
  - Vertex Shader에서 가상 투사 카메라의 View-Projection 행렬을 곱해 새로운 UV 좌표를 계산하고 Fragment Shader로 전달.
  - Fragment Shader에서 해당 좌표 영역 밖의 픽셀은 투명 처리(`discard`)하거나 스크린 배경색 처리.

## 3. 모드별 Three.js 오브젝트 구성 사양
- **L-Shape:** `PlaneGeometry` 2개를 계층 구조(Group)로 묶어 하나는 YZ 평면, 하나는 XZ 평면에 90도 각도로 조립 후 단일 머티리얼 적용 또는 셰이더 공유.
- **Cylinder:** `CylinderGeometry(radius, radius, height, radialSegments, heightSegments, openEnded)` 활용. 내부를 보기 위해 `material.side = THREE.BackSide` 설정.
- **Sphere:** `SphereGeometry(radius, widthSegments, heightSegments)` 활용. 내부 투사를 위해 `material.side = THREE.BackSide` 설정.