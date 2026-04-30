import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

function createFallbackMesh() {
  const geometry = new THREE.TorusKnotGeometry(0.8, 0.26, 200, 32);
  const material = new THREE.MeshStandardMaterial({
    color: 0xd88c62,
    metalness: 0.35,
    roughness: 0.4
  });
  return new THREE.Mesh(geometry, material);
}

export async function mountThreeScene(container, { statusEl } = {}) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);

  const width = container.clientWidth || 800;
  const height = container.clientHeight || 420;

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 1.1, 3.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setSize(width, height);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
  keyLight.position.set(3.2, 4, 3);
  const fillLight = new THREE.DirectionalLight(0xffc8a9, 0.45);
  fillLight.position.set(-2, 1, -2);
  scene.add(ambientLight, keyLight, fillLight);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 1.8;
  controls.maxDistance = 6;
  controls.target.set(0, 0.75, 0);

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let shouldAnimate = !reducedMotionQuery.matches;
  const onMotionPrefChange = (event) => {
    shouldAnimate = !event.matches;
  };
  reducedMotionQuery.addEventListener("change", onMotionPrefChange);

  let activeModel = null;
  try {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync("/models/showcase.glb");
    activeModel = gltf.scene;
    activeModel.position.set(0, 0.15, 0);
    activeModel.scale.setScalar(1.05);
    scene.add(activeModel);
    if (statusEl) statusEl.textContent = "Interactive 3D preview ready.";
  } catch (error) {
    activeModel = createFallbackMesh();
    scene.add(activeModel);
    if (statusEl) {
      statusEl.textContent =
        "3D placeholder loaded. Add public/models/showcase.glb to replace it.";
    }
    console.warn("GLB model not found; using fallback mesh.");
  }

  const clock = new THREE.Clock();
  let rafId = null;

  const onResize = () => {
    const w = container.clientWidth || 800;
    const h = container.clientHeight || 420;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(w, h);
  };

  const onVisibilityChange = () => {
    if (document.hidden && rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
      return;
    }
    if (!document.hidden && !rafId) animate();
  };

  function animate() {
    rafId = requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    if (activeModel && shouldAnimate) {
      activeModel.rotation.y = elapsed * 0.24;
      activeModel.rotation.x = Math.sin(elapsed * 0.35) * 0.05;
    }

    controls.update();
    renderer.render(scene, camera);
  }

  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVisibilityChange);
  animate();

  return function cleanup() {
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener("resize", onResize);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    reducedMotionQuery.removeEventListener("change", onMotionPrefChange);
    controls.dispose();
    renderer.dispose();
    if (renderer.domElement.parentNode === container) {
      container.removeChild(renderer.domElement);
    }
  };
}
