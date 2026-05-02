import { useEffect, useRef } from 'react'

/**
 * WebGL fragment shader background — animated HK neon grid + aurora bloom
 * + scanline. Pure GPU, near-zero CPU cost. Pointer affects shader uniforms.
 */
const VERT = /* glsl */ `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`

const FRAG = /* glsl */ `
precision highp float;
uniform vec2 u_res;
uniform vec2 u_mouse;
uniform float u_time;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), u.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}

// fbm — layered noise for soft aurora bands
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.07;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  vec2 muv = u_mouse / u_res.xy;
  float t = u_time;

  // Soft flowing aurora bands — subtle, professional
  float band = fbm(vec2(uv.x * 2.2, uv.y * 4.0 + t * 0.18));
  float band2 = fbm(vec2(uv.x * 1.6 + t * 0.08, uv.y * 3.0 - t * 0.12));
  float aurora = smoothstep(0.35, 0.85, band * band2);

  // Pantone palette — Very Peri primary + warm gold accent
  vec3 a = vec3(0.49, 0.48, 0.85);   // Very Peri light
  vec3 b = vec3(0.70, 0.68, 0.91);   // periwinkle wash
  vec3 c = vec3(0.84, 0.61, 0.18);   // Mango Mojito gold (sparingly)
  vec3 col = mix(mix(a, b, uv.y), c, aurora * 0.7);

  // Vertical data streaks — abstract scan lines (very subtle)
  float streak = 0.0;
  for (float i = 0.0; i < 5.0; i++) {
    float x = mod(i * 0.213 + sin(t * 0.07 + i) * 0.08, 1.0);
    float dist = abs(uv.x - x);
    streak += smoothstep(0.0035, 0.0, dist) * (0.55 + 0.35 * sin(t * 0.6 + i));
  }
  col += streak * vec3(0.86, 0.84, 0.96) * 0.16;

  // Subtle node particles — slow drift
  float dots = 0.0;
  for (float j = 0.0; j < 6.0; j++) {
    vec2 p = vec2(
      0.15 + 0.7 * fract(j * 0.3137 + t * 0.013),
      0.12 + 0.78 * fract(j * 0.5172 - t * 0.018)
    );
    float d = length((uv - p) * vec2(u_res.x / u_res.y, 1.0));
    dots += 0.0035 / (d + 0.012);
  }
  col += dots * vec3(0.78, 0.76, 0.92) * 0.5;

  // Pointer-driven cool bloom (no warm tones)
  float md = distance(uv, muv);
  float bloom = smoothstep(0.45, 0.0, md) * 0.20;
  col += bloom * vec3(0.56, 0.54, 0.90);

  // Faint isometric grid
  vec2 g = abs(fract(uv * vec2(56.0, 32.0)) - 0.5);
  float grid = smoothstep(0.49, 0.50, max(g.x, g.y)) * 0.04;
  col += grid * vec3(0.64, 0.62, 0.84);

  // Vignette to focus eye on text
  float vig = smoothstep(1.25, 0.30, length(uv - 0.5));
  col *= mix(0.45, 1.05, vig);

  // Film grain — keeps it from looking too clean
  col += (noise(uv * u_res * 0.5 + t * 60.0) - 0.5) * 0.025;

  // Reinhard tone-map
  col = col / (1.0 + col);

  gl_FragColor = vec4(col, 1.0);
}
`

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const sh = gl.createShader(type)!
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh)
    gl.deleteShader(sh)
    throw new Error(log ?? 'shader compile failed')
  }
  return sh
}

export function ShaderBackground({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false })
    if (!gl) return // WebGL unsupported — caller can show fallback

    let program: WebGLProgram | null = null
    try {
      const vs = compile(gl, gl.VERTEX_SHADER, VERT)
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
      program = gl.createProgram()!
      gl.attachShader(program, vs)
      gl.attachShader(program, fs)
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const log = gl.getProgramInfoLog(program)
        gl.deleteProgram(program)
        program = null
        throw new Error(log ?? 'program link failed')
      }
    } catch (e) {
      console.warn('[ShaderBackground] init failed:', e)
      return
    }

    gl.useProgram(program)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(program, 'a_pos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(program, 'u_res')
    const uMouse = gl.getUniformLocation(program, 'u_mouse')
    const uTime = gl.getUniformLocation(program, 'u_time')

    let mouseX = 0
    let mouseY = 0
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      mouseX = (e.clientX - r.left) * (canvas.width / r.width)
      mouseY = canvas.height - (e.clientY - r.top) * (canvas.height / r.height)
    }
    window.addEventListener('pointermove', onMove)

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const w = canvas.clientWidth * dpr
      const h = canvas.clientHeight * dpr
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
        mouseX = w / 2
        mouseY = h / 2
      }
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    let raf = 0
    const start = performance.now()
    const tick = () => {
      const t = (performance.now() - start) / 1000
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform2f(uMouse, mouseX, mouseY)
      gl.uniform1f(uTime, t)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      gl.deleteBuffer(buf)
      if (program) gl.deleteProgram(program)
    }
  }, [])

  return <canvas ref={ref} className={className} aria-hidden />
}
