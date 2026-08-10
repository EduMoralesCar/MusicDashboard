"use client"

import React, { useEffect, useRef } from "react"
import * as THREE from "three"

export function Auth3DVisualizer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return

    const container = containerRef.current
    const canvas = canvasRef.current

    // 1. Scene setup
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x030305, 0.02)

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 28
    camera.position.y = 2

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x0a1a0f, 2.5)
    scene.add(ambientLight)

    const greenPointLight = new THREE.PointLight(0x1db954, 80, 50)
    greenPointLight.position.set(5, 6, 8)
    scene.add(greenPointLight)

    const cyanPointLight = new THREE.PointLight(0x1ed760, 60, 50)
    cyanPointLight.position.set(-6, -4, 6)
    scene.add(cyanPointLight)

    const coreLight = new THREE.PointLight(0x00ff66, 40, 20)
    coreLight.position.set(0, 0, 0)
    scene.add(coreLight)

    // 5. Main 3D Audio Visualizer Sphere (Point Cloud + Wireframe)
    const sphereRadius = 5.2
    const sphereGeo = new THREE.IcosahedronGeometry(sphereRadius, 5)
    const posAttr = sphereGeo.attributes.position
    const vertexCount = posAttr.count
    const originalPositions = new Float32Array(posAttr.array)

    // Core point cloud with pulsating neon dots
    const pointsMat = new THREE.PointsMaterial({
      color: 0x1db954,
      size: 0.16,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    })
    const audioSpherePoints = new THREE.Points(sphereGeo, pointsMat)
    scene.add(audioSpherePoints)

    // Inner wireframe sphere
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x0e5a27,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    })
    const innerWireSphere = new THREE.Mesh(sphereGeo, wireMat)
    scene.add(innerWireSphere)

    // 6. Orbital Sound Waves / Holographic Rings
    const ringGroup = new THREE.Group()

    const createRing = (radius: number, tube: number, color: number, opacity: number, rotX: number, rotY: number) => {
      const ringGeo = new THREE.TorusGeometry(radius, tube, 16, 100)
      const ringMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.8,
        wireframe: true,
        transparent: true,
        opacity,
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = rotX
      ring.rotation.y = rotY
      return ring
    }

    const ring1 = createRing(8.2, 0.05, 0x1db954, 0.6, Math.PI / 3, Math.PI / 6)
    const ring2 = createRing(10.5, 0.04, 0x1ed760, 0.45, -Math.PI / 4, Math.PI / 3)
    const ring3 = createRing(12.8, 0.03, 0x00ff88, 0.35, Math.PI / 2.2, -Math.PI / 5)

    ringGroup.add(ring1)
    ringGroup.add(ring2)
    ringGroup.add(ring3)
    scene.add(ringGroup)

    // 7. Ambient Particle Field (1,200 Floating Sound Dust Particles)
    const particleCount = 1200
    const particleGeo = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    const particleVelocities = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      particlePositions[i3] = (Math.random() - 0.5) * 60
      particlePositions[i3 + 1] = (Math.random() - 0.5) * 45
      particlePositions[i3 + 2] = (Math.random() - 0.5) * 50

      particleVelocities[i3] = (Math.random() - 0.5) * 0.02
      particleVelocities[i3 + 1] = (Math.random() - 0.5) * 0.02
      particleVelocities[i3 + 2] = (Math.random() - 0.5) * 0.02
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3))

    const particleMat = new THREE.PointsMaterial({
      color: 0x2ef07a,
      size: 0.12,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    })

    const particleField = new THREE.Points(particleGeo, particleMat)
    scene.add(particleField)

    // 8. Mouse Parallax Tracking
    let targetMouseX = 0
    let targetMouseY = 0
    let currentMouseX = 0
    let currentMouseY = 0

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      targetMouseX = (x - 0.5) * 2
      targetMouseY = (y - 0.5) * 2
    }

    window.addEventListener("mousemove", handleMouseMove)

    // 9. Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return
      const width = container.clientWidth
      const height = container.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    // 10. Animation Loop
    let animationFrameId: number
    let clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      // Smooth mouse interpolation (damping / lerp)
      currentMouseX += (targetMouseX - currentMouseX) * 0.05
      currentMouseY += (targetMouseY - currentMouseY) * 0.05

      // Camera tilt parallax
      camera.position.x = currentMouseX * 5
      camera.position.y = 2 + -currentMouseY * 4
      camera.lookAt(0, 0, 0)

      // Audio waveform vertex morphing on the sphere
      const positions = posAttr.array as Float32Array
      for (let i = 0; i < vertexCount; i++) {
        const i3 = i * 3
        const ox = originalPositions[i3]
        const oy = originalPositions[i3 + 1]
        const oz = originalPositions[i3 + 2]

        // 3D procedural acoustic frequencies calculation
        const frequency =
          Math.sin(ox * 0.8 + elapsedTime * 2.2) *
          Math.cos(oy * 0.8 + elapsedTime * 1.8) *
          Math.sin(oz * 0.8 + elapsedTime * 2.0)

        const displacement = 1 + frequency * 0.18

        positions[i3] = ox * displacement
        positions[i3 + 1] = oy * displacement
        positions[i3 + 2] = oz * displacement
      }
      posAttr.needsUpdate = true

      // Rotate sphere core
      audioSpherePoints.rotation.y = elapsedTime * 0.15
      audioSpherePoints.rotation.x = Math.sin(elapsedTime * 0.1) * 0.2
      innerWireSphere.rotation.copy(audioSpherePoints.rotation)

      // Rotate sound rings at individual harmonic intervals
      ring1.rotation.z = elapsedTime * 0.25
      ring1.rotation.y = Math.sin(elapsedTime * 0.2) * 0.5
      ring2.rotation.z = -elapsedTime * 0.2
      ring2.rotation.x = Math.cos(elapsedTime * 0.15) * 0.5
      ring3.rotation.y = elapsedTime * 0.18

      // Slow particle float
      particleField.rotation.y = elapsedTime * 0.03
      particleField.rotation.x = elapsedTime * 0.015

      // Dynamic light orbit
      greenPointLight.position.x = Math.sin(elapsedTime * 0.8) * 10
      greenPointLight.position.z = Math.cos(elapsedTime * 0.8) * 10
      cyanPointLight.position.x = -Math.sin(elapsedTime * 0.6) * 12
      cyanPointLight.position.y = Math.cos(elapsedTime * 0.6) * 8

      renderer.render(scene, camera)
    }

    animate()

    // 11. Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("mousemove", handleMouseMove)
      resizeObserver.disconnect()

      sphereGeo.dispose()
      pointsMat.dispose()
      wireMat.dispose()
      ring1.geometry.dispose()
      ;(ring1.material as THREE.Material).dispose()
      ring2.geometry.dispose()
      ;(ring2.material as THREE.Material).dispose()
      ring3.geometry.dispose()
      ;(ring3.material as THREE.Material).dispose()
      particleGeo.dispose()
      particleMat.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden pointer-events-auto">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  )
}
