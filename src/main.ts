import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x007fff });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1);
scene.add(light);

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
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
  }
}

renderer.domElement.addEventListener("click", () => {
  renderer.domElement.requestPointerLock();
});
document.addEventListener("mousemove", onMouseMove);

function updateCameraPosition() {
  // Forward (W or ArrowUp)
  if (keysPressed["w"] || keysPressed["arrowup"]) {
    camera.position.z -= moveSpeed;
  }
  // Backward (S or ArrowDown)
  if (keysPressed["s"] || keysPressed["arrowdown"]) {
    camera.position.z += moveSpeed;
  }
  // Left (A or ArrowLeft)
  if (keysPressed["a"] || keysPressed["arrowleft"]) {
    camera.position.x -= moveSpeed;
  }
  // Right (D or ArrowRight)
  if (keysPressed["d"] || keysPressed["arrowright"]) {
    camera.position.x += moveSpeed;
  }
}

function animate() {
  requestAnimationFrame(animate);
  updateCameraPosition();
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
