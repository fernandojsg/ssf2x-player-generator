precision mediump float;
uniform sampler2D uSampler;
uniform vec2 resolution;
uniform int enabled;

void main( void ) {
  vec2 pos = gl_FragCoord.xy / resolution;

  if (enabled == 1) {
    gl_FragColor = mod(gl_FragCoord.y, 2.0) * texture2D(uSampler, pos);
  } else {
    gl_FragColor = texture2D(uSampler, pos);
  }
}