import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Faithful port of the "BreathDearMedusae" Antigravity effect
// (https://github.com/Hinarosha/BreathDearMedusae): an instanced grid of
// rounded-pill particles driven by a GLSL shader. Each particle drifts in a
// curl-like flow and forms a breathing halo that follows the cursor, growing,
// stretching, pointing radially and shifting through Google brand colors near
// the ring. Shaders and constants are kept exactly as the original.
function Particles() {
  const meshRef = useRef()
  const { viewport } = useThree()

  const countX = 100
  const countY = 55
  const count = countX * countY

  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    }),
    []
  )

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: `
            uniform float uTime;
            uniform vec2 uMouse;
            varying vec2 vUv;
            varying float vSize;
            varying vec2 vPos;

            attribute vec3 aOffset;
            attribute float aRandom;

            #define PI 3.14159265359

            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
            }
            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);

                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));

                return mix( mix(a, b, f.x), mix(c, d, f.x), f.y);
            }

            mat2 rotate2d(float _angle){
                return mat2(cos(_angle), sin(_angle),
                            -sin(_angle), cos(_angle));
            }

            void main() {
                vUv = uv;

                vec3 pos = aOffset;

                float driftSpeed = uTime * 0.15;

                float dx = sin(driftSpeed + pos.y * 0.5) + sin(driftSpeed * 0.5 + pos.y * 2.0);
                float dy = cos(driftSpeed + pos.x * 0.5) + cos(driftSpeed * 0.5 + pos.x * 2.0);

                pos.x += dx * 0.25;
                pos.y += dy * 0.25;

                vec2 relToMouse = pos.xy - uMouse;
                float distFromMouse = length(relToMouse);
                float angleToMouse = atan(relToMouse.y, relToMouse.x);

                float shapeFactor = noise(vec2(angleToMouse * 2.0, uTime * 0.1));

                float breathCycle = sin(uTime * 0.8);

                float currentRadius = 2.2 + breathCycle * 0.3 + (shapeFactor * 0.5);

                float dist = distFromMouse;
                float rimWidth = 1.8;
                float rimInfluence = smoothstep(rimWidth, 0.0, abs(dist - currentRadius));

                vec2 pushDir = normalize(relToMouse + vec2(0.0001, 0.0));

                float pushAmt = (breathCycle * 0.5 + 0.5) * 0.5;

                pos.xy += pushDir * pushAmt * rimInfluence;

                pos.z += rimInfluence * 0.3 * sin(uTime);

                float baseSize = 0.012 + (sin(uTime + pos.x)*0.003);

                float activeSize = 0.055;
                float currentScale = (baseSize + (rimInfluence * activeSize)) * 0.55;

                float stretch = rimInfluence * 0.02 * 0.9;

                vec3 transformed = position;
                transformed.x *= (currentScale + stretch);
                transformed.y *= currentScale * 0.85;

                vSize = rimInfluence;
                vPos = pos.xy;

                float targetAngle = angleToMouse;

                float finalAngle = targetAngle;

                transformed.xy = rotate2d(finalAngle) * transformed.xy;

                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos + transformed, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uTime;
            varying vec2 vUv;
            varying float vSize;
            varying vec2 vPos;

            void main() {
                vec2 center = vec2(0.5);
                vec2 pos = abs(vUv - center) * 2.0;

                float d = pow(pow(pos.x, 2.6) + pow(pos.y, 2.6), 1.0/2.6);
                float alpha = 1.0 - smoothstep(0.8, 1.0, d);

                if (alpha < 0.01) discard;

                vec3 black = vec3(0.08, 0.08, 0.1);
                vec3 cBlue = vec3(0.26, 0.52, 0.96);
                vec3 cRed = vec3(0.92, 0.26, 0.21);
                vec3 cYellow = vec3(0.98, 0.73, 0.01);

                float t = uTime * 1.2;

                float p1 = sin(vPos.x * 0.8 + t);
                float p2 = sin(vPos.y * 0.8 + t * 0.8 + p1);

                vec3 activeColor = mix(cBlue, cRed, p1 * 0.5 + 0.5);
                activeColor = mix(activeColor, cYellow, p2 * 0.5 + 0.5);

                vec3 finalColor = mix(black, activeColor, smoothstep(0.1, 0.8, vSize));
                float finalAlpha = alpha * mix(0.4, 0.95, vSize);

                gl_FragColor = vec4(finalColor, finalAlpha);
            }
        `,
        transparent: true,
        depthWrite: false,
      }),
    [uniforms]
  )

  useEffect(() => {
    if (!meshRef.current) return

    const offsets = new Float32Array(count * 3)
    const randoms = new Float32Array(count)
    const angles = new Float32Array(count)

    const gridWidth = 40
    const gridHeight = 22
    const jitter = 0.25

    let i = 0
    for (let y = 0; y < countY; y++) {
      for (let x = 0; x < countX; x++) {
        const u = x / (countX - 1)
        const v = y / (countY - 1)

        let px = (u - 0.5) * gridWidth
        let py = (v - 0.5) * gridHeight

        px += (Math.random() - 0.5) * jitter
        py += (Math.random() - 0.5) * jitter

        offsets[i * 3] = px
        offsets[i * 3 + 1] = py
        offsets[i * 3 + 2] = 0

        randoms[i] = Math.random()
        angles[i] = Math.random() * Math.PI * 2
        i++
      }
    }

    meshRef.current.geometry.setAttribute('aOffset', new THREE.InstancedBufferAttribute(offsets, 3))
    meshRef.current.geometry.setAttribute('aRandom', new THREE.InstancedBufferAttribute(randoms, 1))
    meshRef.current.geometry.setAttribute('aAngleOffset', new THREE.InstancedBufferAttribute(angles, 1))
  }, [count, countX, countY])

  const hovering = useRef(true)

  useEffect(() => {
    const handleLeave = () => (hovering.current = false)
    const handleEnter = () => (hovering.current = true)

    document.body.addEventListener('mouseleave', handleLeave)
    document.body.addEventListener('mouseenter', handleEnter)

    return () => {
      document.body.removeEventListener('mouseleave', handleLeave)
      document.body.removeEventListener('mouseenter', handleEnter)
    }
  }, [])

  useFrame((state) => {
    const { clock, pointer } = state
    material.uniforms.uTime.value = clock.getElapsedTime()

    let targetX = 0
    let targetY = 0

    if (hovering.current) {
      targetX = (pointer.x * viewport.width) / 2
      targetY = (pointer.y * viewport.height) / 2
    }

    const current = material.uniforms.uMouse.value

    const dragFactor = 0.055

    current.x += (targetX - current.x) * dragFactor
    current.y += (targetY - current.y) * dragFactor
  })

  return <instancedMesh ref={meshRef} args={[geometry, material, count]} />
}

// Hero-only background. The canvas is transparent so the effect layers over the
// themed hero (in light mode it matches the white-background reference exactly).
// We pause the render loop entirely while the hero is scrolled off-screen so the
// GPU/CPU isn't burning frames for an invisible canvas — the main cause of the
// lag/stutter elsewhere on the page.
export default function ParticleBackground() {
  const wrapRef = useRef(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const el = wrapRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.01,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrapRef} className="absolute inset-0 z-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5] }}
        dpr={[1, 1.5]}
        frameloop={visible ? 'always' : 'never'}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        <Particles />
      </Canvas>
    </div>
  )
}
