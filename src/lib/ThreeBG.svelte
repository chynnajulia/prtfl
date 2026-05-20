<script>
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { activeStation } from "$lib/stores";

  let threeContainer;
  let matrixCanvas;
  let scene, camera, renderer;
  let animationId;

  // ─── Node + station sizing (computed on init and resize) ────
  // These are in world units, recalculated when window resizes
  let nodeRadius = 3;
  let stationPositions = [0, 0, 0];

  // ─── Camera travel ──────────────────────────────────────────
  // Instead of jumping instantly, we lerp the camera Y position
  // toward a target each frame — this creates the "travelling
  // along the line" effect
  let cameraTargetY = 0;

  // ─── Station + pulse state ──────────────────────────────────
  let stationMeshes = [];
  let pulseRings = [];
  let pulseScales = [];
  let pulseOpacities = [];
  let currentStation = 0;

  activeStation.subscribe((val) => {
    currentStation = val;
    // When station changes, set the camera's travel destination
    cameraTargetY = stationPositions[val];
  });

  // ─── Matrix rain state ──────────────────────────────────────
  let matrixCtx;
  let matrixDrops = [];
  let matrixFrame = 0;
  const MATRIX_SPEED = 6;

  // ────────────────────────────────────────────────────────────
  //  WORLD UNIT HELPERS
  //
  //  The orthographic camera shows exactly 6 world units
  //  vertically (top=3, bottom=-3). So:
  //    1 world unit = window.innerHeight / 6 pixels
  //
  //  We use this to convert the desired node diameter
  //  (= smaller screen dimension) into world units.
  // ────────────────────────────────────────────────────────────
  function computeSizing() {
    const pixelsPerUnit = window.innerHeight / 6;
    const smallerDim = Math.min(window.innerWidth, window.innerHeight);

    // Node radius = half the smaller screen dimension, in world units
    nodeRadius = (smallerDim / 4) / pixelsPerUnit;

    // Space stations 3 diameters apart so only one is visible at a time
    // Station 0 is "above" (positive Y), station 2 is "below" (negative Y)
    const spacing = nodeRadius * 6;
    stationPositions = [spacing, 0, -spacing];
  }

  // ────────────────────────────────────────────────────────────
  //  MATRIX RAIN
  // ────────────────────────────────────────────────────────────
  function initMatrix() {
    matrixCtx = matrixCanvas.getContext("2d");
    resizeMatrix();
  }

  function resizeMatrix() {
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    const fontSize = 14;
    const cols = Math.floor(window.innerWidth / fontSize);
    matrixDrops = Array(cols).fill(1);
  }

  function drawMatrix() {
    const fontSize = 14;
    matrixCtx.fillStyle = "rgba(243, 239, 249, 0.1)";
    matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    matrixCtx.fillStyle = "rgba(190, 190, 222, 0.35)"; // rgba(80, 80, 80, 0.35)
    matrixCtx.font = `${fontSize}px monospace`;

    for (let i = 0; i < matrixDrops.length; i++) { /* TODO EXPLAIN */
      const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノABCDEFGHIJKLMNOP0123456789";
      const char = chars[Math.floor(Math.random() * chars.length)];
      matrixCtx.fillText(char, i * fontSize, matrixDrops[i] * fontSize);

      if (matrixDrops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
        matrixDrops[i] = 0;
      }
      matrixDrops[i]++;
    }
  }

  // ────────────────────────────────────────────────────────────
  //  THREE.JS SCENE
  // ────────────────────────────────────────────────────────────
  function initThree() {
    computeSizing();

    scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.OrthographicCamera(
      -aspect * 3, aspect * 3,
      3, -3,
      0.1, 100
    );
    camera.position.z = 5;
    // Start camera at station 0's position
    camera.position.y = stationPositions[0];
    cameraTargetY = stationPositions[0];

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    threeContainer.appendChild(renderer.domElement);

    buildTrainLine();
    buildStationNodes();
  }

  function buildTrainLine() {
    const top = stationPositions[0] + nodeRadius * 0.6;
    const bottom = stationPositions[stationPositions.length - 1] - nodeRadius * 0.6;

    const points = [
      new THREE.Vector3(0, top, 0),
      new THREE.Vector3(0, bottom, 0)
    ];

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0xcccccc,
      transparent: true,
      opacity: 0.4
    });

    scene.add(new THREE.Line(geometry, material));
  }

  function buildStationNodes() {
    stationPositions.forEach((y, i) => {
      // ── Main node circle (outline style, barely filled) ──
      // We use two circles: a faint filled disc for the glow,
      // and a ring for the crisp outline edge
      const discGeo = new THREE.CircleGeometry(nodeRadius, 128);
      const discMat = new THREE.MeshBasicMaterial({
        color: 0x7930ff,
        transparent: true,
        opacity: 0.03   // very faint — just a whisper of color
      });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.position.set(0, y, 0);
      scene.add(disc);

      // ── Pulse ring (expands outward from the node edge) ──
      const pulseGeo = new THREE.RingGeometry(nodeRadius * 0.98, nodeRadius, 128);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: 0x7930ff,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide
      });
      const pulse = new THREE.Mesh(pulseGeo, pulseMat);
      pulse.position.set(0, y, 0);
      scene.add(pulse);
      pulseRings.push(pulse);
      pulseScales.push(1);
      pulseOpacities.push(0);

      // The visible outline ring
      // RingGeometry(innerRadius, outerRadius, segments)
      // We make it thin — inner = 98% of nodeRadius
      const ringGeo = new THREE.CircleGeometry(nodeRadius, 128);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xcccccc,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(0, y, 0);
      scene.add(ring);
      stationMeshes.push({ disc, ring });
    });
  }

  // ────────────────────────────────────────────────────────────
  //  ANIMATION LOOP
  // ────────────────────────────────────────────────────────────
  function animate() {
    animationId = requestAnimationFrame(animate);

    matrixFrame = (matrixFrame + 1) % MATRIX_SPEED;
    if (matrixFrame === 0) drawMatrix();

    updateCamera();
    updateStations();

    renderer.render(scene, camera);
  }

  function updateCamera() {
    // Lerp camera Y toward the target station position.
    // 0.06 = easing factor: higher = snappier, lower = floatier.
    // This runs every frame, so the camera decelerates as it
    // approaches the target — giving a natural easing feel.
    
    camera.position.y += (cameraTargetY - camera.position.y) * 0.02;
  
  }

  function updateStations() {
    stationMeshes.forEach(({ disc, ring }, i) => {
      const isActive = i === currentStation;

      // Active node glows purple; inactive nodes stay gray
      ring.material.color.set(isActive ? 0xb289e2 : 0x9f90c2e6);
      ring.material.opacity = isActive ? 1 : 0.2;
      disc.material.opacity = isActive ? 0.06 : 0.02;

      if (isActive) {
        pulseScales[i] = (pulseScales[i] + 0.005) % 1.6;
        pulseOpacities[i] = Math.max(0, 0.6 - (pulseScales[i] / 1.6) * 0.6);
      } else {
        pulseOpacities[i] = 0;
        pulseScales[i] = 1;
      }

      pulseRings[i].scale.setScalar(pulseScales[i] || 1);
      pulseRings[i].material.opacity = pulseOpacities[i];
    });
  }

  // ────────────────────────────────────────────────────────────
  //  RESIZE
  // ────────────────────────────────────────────────────────────
  function handleResize() {
    computeSizing();

    const aspect = window.innerWidth / window.innerHeight;
    camera.left = -aspect * 3;
    camera.right = aspect * 3;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    resizeMatrix();

    // Snap camera to current station after resize
    // (station positions changed, so recalculate target)
    cameraTargetY = stationPositions[currentStation];
  }

  // ────────────────────────────────────────────────────────────
  //  MOUNT & CLEANUP
  // ────────────────────────────────────────────────────────────
  onMount(() => {
    initMatrix();
    initThree();
    animate();

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  });
</script>

<canvas bind:this={matrixCanvas} class="matrix-layer"></canvas>
<div bind:this={threeContainer} class="three-layer"></div>
<!--<div class="grain-layer"></div>-->

<style>
  .matrix-layer,
  .three-layer,
  .grain-layer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100dvh;
    pointer-events: none;
  }

  .matrix-layer { z-index: -30; }
  .three-layer  { z-index: -20; }

  .grain-layer { /* TODO */
    z-index: -10;
    opacity: 0.04;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 200px 200px;
  }

  .three-layer :global(canvas) {
    width: 100% !important;
    height: 100% !important;
    display: block;
  }
</style>