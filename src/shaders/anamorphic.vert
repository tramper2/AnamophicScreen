uniform mat4 projectorViewMatrix;
uniform mat4 projectorProjectionMatrix;

varying vec4 vTextureCoords;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  
  // Transform the world position to the projector's clip space
  vTextureCoords = projectorProjectionMatrix * projectorViewMatrix * worldPosition;
  
  // Pass normal and position for shading calculations
  vNormal = normalize(normalMatrix * normal);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
