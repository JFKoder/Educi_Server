import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Remove cube
// const geometry = new THREE.BoxGeometry();
// const material = new THREE.MeshStandardMaterial({ color: 0x007fff });
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

// Load Earth model
let earth: THREE.Object3D | null = null;
const earthLoader = new GLTFLoader();
earthLoader.load('Scenes/Earth/scene.gltf', (gltf) => {
  earth = gltf.scene;
  earth.position.set(0, 0, 0);
  earth.scale.set(0.01, 0.01, 0.01); // Scale Earth to 1 meter

  // Load textures and apply to Earth materials
  const textureLoader = new THREE.TextureLoader();
  const diffuseMap = textureLoader.load('Scenes/Earth/textures/Material.002_diffuse.jpeg');

  earth.traverse((child: any) => {
    if (child.isMesh && child.material) {
      if (child.material.map === null || child.material.map === undefined) {
        child.material.map = diffuseMap;
        child.material.needsUpdate = true;
      }
    }
  });

  scene.add(earth);
}, undefined, (error) => {
  console.error('Error loading Earth model:', error);
});

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1);
scene.add(light);

// Add a sun (directional light) for good lighting
const sun = new THREE.DirectionalLight(0xfff7b2, 2.5); // warm color, higher intensity
sun.position.set(10, 20, 10);
sun.castShadow = true;
scene.add(sun);

// Add a spherical sky using the Clouds.png texture
const textureLoader = new THREE.TextureLoader();
textureLoader.load('/textures/Clouds.png', (cloudTexture) => {
  const skyGeometry = new THREE.SphereGeometry(100, 64, 64);
  const skyMaterial = new THREE.MeshBasicMaterial({
    map: cloudTexture,
    side: THREE.BackSide // Render inside of sphere
  });
  const skySphere = new THREE.Mesh(skyGeometry, skyMaterial);
  scene.add(skySphere);
});

camera.position.z = 3;

const keysPressed: { [key: string]: boolean } = {};

window.addEventListener("keydown", (event) => {
  keysPressed[event.key.toLowerCase()] = true;
});
window.addEventListener("keyup", (event) => {
  keysPressed[event.key.toLowerCase()] = false;
});

const moveSpeed = 0.05;

let yaw = 0;
let pitch = 0;
const sensitivity = 0.002;

function onMouseMove(event: MouseEvent) {
  if (document.pointerLockElement === renderer.domElement) {
    yaw -= event.movementX * sensitivity;
    pitch -= event.movementY * sensitivity;
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch)); // Clamp pitch
    // Use quaternion for proper yaw/pitch
    const quat = new THREE.Quaternion();
    quat.setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
    camera.quaternion.copy(quat);
  }
}

renderer.domElement.addEventListener("click", () => {
  renderer.domElement.requestPointerLock();
});
document.addEventListener("mousemove", onMouseMove);

function updateCameraPosition() {
  // Calculate direction vectors based on camera rotation (yaw/pitch)
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  direction.y = 0; // Prevent moving up/down
  direction.normalize();

  // Calculate right vector
  const right = new THREE.Vector3();
  right.crossVectors(camera.up, direction).normalize();

  // Forward (W or ArrowUp)
  if (keysPressed["w"] || keysPressed["arrowup"]) {
    camera.position.addScaledVector(direction, moveSpeed);
  }
  // Backward (S or ArrowDown)
  if (keysPressed["s"] || keysPressed["arrowdown"]) {
    camera.position.addScaledVector(direction, -moveSpeed);
  }
  // Left (A or ArrowLeft)
  if (keysPressed["a"] || keysPressed["arrowleft"]) {
    camera.position.addScaledVector(right, moveSpeed);
  }
  // Right (D or ArrowRight)
  if (keysPressed["d"] || keysPressed["arrowright"]) {
    camera.position.addScaledVector(right, -moveSpeed);
  }
}

const loader = new GLTFLoader();
loader.load('Scenes/Main/Main1.glb', (gltf) => {
  scene.add(gltf.scene);
}, undefined, (error) => {
  console.error('Error loading GLB model:', error);
});

// Virtual joypad for touchscreen devices
function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

if (isTouchDevice()) {
  const joypad = document.createElement('div');
  joypad.style.position = 'fixed';
  joypad.style.left = '20px';
  joypad.style.bottom = '20px';
  joypad.style.width = '120px';
  joypad.style.height = '120px';
  joypad.style.zIndex = '1000';
  joypad.style.display = 'flex';
  joypad.style.flexWrap = 'wrap';
  joypad.style.alignItems = 'center';
  joypad.style.justifyContent = 'center';
  joypad.style.background = 'rgba(0,0,0,0.2)';
  joypad.style.borderRadius = '50%';

  const directions = [
    { key: 'w', label: '↑', style: 'left:40px;top:0px;' },
    { key: 'a', label: '←', style: 'left:0px;top:40px;' },
    { key: 's', label: '↓', style: 'left:40px;top:80px;' },
    { key: 'd', label: '→', style: 'left:80px;top:40px;' }
  ];

  directions.forEach(dir => {
    const btn = document.createElement('button');
    btn.textContent = dir.label;
    btn.style.position = 'absolute';
    btn.style.width = '40px';
    btn.style.height = '40px';
    btn.style.fontSize = '24px';
    btn.style.opacity = '0.8';
    btn.style.borderRadius = '50%';
    btn.style.border = 'none';
    btn.style.background = '#333';
    btn.style.color = '#fff';
    btn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
    btn.style["touchAction"] = "none";
    btn.setAttribute('style', btn.getAttribute('style') + dir.style);
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      keysPressed[dir.key] = true;
    });
    btn.addEventListener('touchend', (e) => {
      e.preventDefault();
      keysPressed[dir.key] = false;
    });
    joypad.appendChild(btn);
  });

  joypad.style.position = 'fixed';
  joypad.style.pointerEvents = 'auto';
  joypad.style.userSelect = 'none';
  joypad.style.touchAction = 'none';
  joypad.style.boxSizing = 'border-box';
  joypad.style.padding = '0';
  joypad.style.margin = '0';
  joypad.style.overflow = 'visible';
  joypad.style.border = '2px solid #888';
  joypad.style.background = 'rgba(0,0,0,0.15)';
  joypad.style.backdropFilter = 'blur(2px)';
  joypad.style.webkitBackdropFilter = 'blur(2px)';
  joypad.style.boxShadow = '0 2px 12px rgba(0,0,0,0.2)';
  joypad.style.transition = 'opacity 0.2s';
  joypad.style.opacity = '1';
  joypad.style.display = 'block';
  joypad.style.width = '120px';
  joypad.style.height = '120px';
  joypad.style.left = '20px';
  joypad.style.bottom = '20px';
  joypad.style.borderRadius = '50%';
  joypad.style.position = 'fixed';
  joypad.style.pointerEvents = 'auto';
  joypad.style.zIndex = '1000';
  joypad.style.userSelect = 'none';
  joypad.style.touchAction = 'none';
  joypad.style.boxSizing = 'border-box';
  joypad.style.padding = '0';
  joypad.style.margin = '0';
  joypad.style.overflow = 'visible';
  joypad.style.border = '2px solid #888';
  joypad.style.background = 'rgba(0,0,0,0.15)';
  joypad.style.backdropFilter = 'blur(2px)';
  joypad.style.webkitBackdropFilter = 'blur(2px)';
  joypad.style.boxShadow = '0 2px 12px rgba(0,0,0,0.2)';
  joypad.style.transition = 'opacity 0.2s';
  joypad.style.opacity = '1';
  document.body.appendChild(joypad);

  // Touch drag to control camera yaw/pitch
  let lastTouchX: number | null = null;
  let lastTouchY: number | null = null;
  renderer.domElement.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
    }
  });
  renderer.domElement.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && lastTouchX !== null && lastTouchY !== null) {
      const dx = e.touches[0].clientX - lastTouchX;
      const dy = e.touches[0].clientY - lastTouchY;
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
      yaw -= dx * sensitivity;
      pitch -= dy * sensitivity;
      pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
      const quat = new THREE.Quaternion();
      quat.setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
      camera.quaternion.copy(quat);
    }
  });
  renderer.domElement.addEventListener('touchend', (e) => {
    if (e.touches.length === 0) {
      lastTouchX = null;
      lastTouchY = null;
    }
  });
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onResize);
window.addEventListener('orientationchange', onResize);

function animate() {
  requestAnimationFrame(animate);
  updateCameraPosition();
  if (earth) {
    earth.rotation.y += 0.005; // Rotate Earth around Y axis
  }
  renderer.render(scene, camera);
}
animate();
