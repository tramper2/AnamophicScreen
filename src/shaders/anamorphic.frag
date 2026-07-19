uniform sampler2D videoTexture;
uniform float opacity;
uniform vec3 screenColor;
uniform float useLighting;

varying vec4 vTextureCoords;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
  // 1. Perspective divide
  vec3 projCoords = vTextureCoords.xyz / vTextureCoords.w;
  
  // 2. Map clip coordinates [-1, 1] to UV space [0, 1]
  vec2 projUV = projCoords.xy * 0.5 + 0.5;
  
  // 3. Simple diffuse lighting/shading to emphasize 3D geometry depth
  vec3 lightDirection = normalize(vec3(5.0, 10.0, 7.5));
  float diffuse = max(dot(vNormal, lightDirection), 0.0);
  float ambient = 0.35;
  float light = mix(1.0, ambient + diffuse * 0.65, useLighting);
  
  // 4. Procedural grid mapping for the non-projected screen areas
  float gridScale = 1.0; // 1-meter grid spacing
  vec3 gridFract = abs(fract(vWorldPosition * gridScale - 0.5) - 0.5);
  float gridThick = 0.02; // Grid line thickness
  float gridVal = 0.0;
  if (gridFract.x < gridThick || gridFract.y < gridThick || gridFract.z < gridThick) {
    gridVal = 0.25;
  }
  
  vec3 defaultScreen = mix(screenColor, vec3(0.2, 0.25, 0.35), gridVal);
  
  // 5. Sample the texture if inside projector frustum, otherwise draw grid screen
  vec4 finalColor;
  if (vTextureCoords.w > 0.0 && projUV.x >= 0.0 && projUV.x <= 1.0 && projUV.y >= 0.0 && projUV.y <= 1.0) {
    vec4 texColor = texture2D(videoTexture, projUV);
    finalColor = vec4(texColor.rgb * light, texColor.a);
  } else {
    // Out of bounds - render default screen surface with grid lines
    finalColor = vec4(defaultScreen * light, 1.0);
  }
  
  gl_FragColor = finalColor;
}
