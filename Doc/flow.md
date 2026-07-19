## 1. 사용자 시나리오 플로우 (User Scenario Flow)
1. 사용자가 GitHub Pages URL 접속.
2. 시스템이 기본 샘플 비디오와 평면 스크린 모드로 3D Scene 초기화 및 자동 재생.
3. 사용자가 컨트롤 패널에서 'L자형 스크린' 선택.
4. 3D 뷰포트 안의 메쉬가 L자형으로 실시간 전환 및 비디오 연속 재생 유지.
5. 사용자가 '로컬 파일 업로드' 버튼을 클릭하여 본인의 MP4 파일 선택.
6. 기존 텍스처가 해제되고 새 비디오가 인메모리 로드되어 실시간 애나모픽 변환 적용.
7. 마우스 드래그로 시점을 돌려보며 왜곡 확인 후, 'Sweet Spot 보기' 클릭 시 고정 정면 시점으로 카메라 원위치.

## 2. 데이터 흐름도 (Data Flow Architecture)
```
[User Input: Video File] 
       │
       ▼
[URL.createObjectURL] ──> [HTML5 <video> Element (Hidden/Muted)]
                                 │
                                 ▼ (Every Frame)
                        [THREE.VideoTexture]
                                 │
                                 ▼ (Bind to Material)
                  [Custom WebGL Projective Shader]
                                 │
  [Matrix Parameters] ───────────┼─────────── [Control GUI (Radius, Angle, Aspect)]
  (Projector/Camera Matrix)      │
                                 ▼
                     [Three.js WebGLRenderer]
                                 │
                                 ▼
                         [HTML5 <canvas>]
```

## 3. 프레임 업데이트 루프 (Render Loop Lifecycle)
1. `requestAnimationFrame` 호출.
2. `video.readyState === video.HAVE_CURRENT_DATA` 확인 후 비디오 텍스처 플래그 업데이트 (`texture.needsUpdate = true`).
3. OrbitControls 업데이트 및 가상 프로젝션 매트릭스 셰이더 유니폼(Uniforms) 변수 동기화.
4. `renderer.render(scene, camera)` 구동.