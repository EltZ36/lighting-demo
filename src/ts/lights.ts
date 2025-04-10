//taken from https://github.com/mrdoob/three.js/blob/master/examples/webgl_geometry_terrain_raycast.html
import * as THREE from "three";
import { OBB } from "three/addons/math/OBB.js";
//import Stats from "three/examples/jsm/libs/stats.module.js";
//import { ImprovedNoise, OrbitControls } from "three/examples/jsm/Addons.js";
//import { OrbitControls } from "three/examples/jsm/Addons.js";

let container: HTMLDivElement;
//let stats: Stats;
let camera: THREE.PerspectiveCamera,
  //controls: OrbitControls,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer;
let sandMesh: THREE.Mesh;
let circleMesh: THREE.Mesh;
let waterMesh: THREE.Mesh;
let circleBox: THREE.Box3;
let waterBox: THREE.Box3;
let sandPlane: THREE.PlaneGeometry;
//let texture: THREE.Texture;
//let helper: THREE.Mesh;
//const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const unitsAwayCamera = 250;
const maxFromGround = 120;
const movement = {
  up: false,
  down: false,
  left: false,
  right: false,
  ascend: false,
  descend: false,
};

//const worldWidth = 512,
//worldDepth = 128;
//const worldHalfWidth = worldWidth / 2,
//worldHalfDepth = worldDepth / 2;

init();

function init(): void {
  const containerElement = document.querySelector<HTMLDivElement>("#app")!;
  container = containerElement;
  container.innerHTML = "";

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  container.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xbfd1e5);

  camera = new THREE.PerspectiveCamera(
    100,
    window.innerWidth / window.innerHeight,
    10,
    5000
  );
  camera.position.set(0, 500, 250);

  /*controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 1000;
  controls.maxDistance = 10000;
  controls.maxPolarAngle = Math.PI / 2;

  //const data = generateHeight(worldWidth, worldDepth);

  controls.target.y = 500;
  //controls.target.y = data[worldHalfWidth + worldHalfDepth * worldWidth] + 500;
  camera.position.set(2000, controls.target.y + 2000, 0);
  controls.update(); */

  //camera.position.set(100, 1000, 0);
  sandPlane = new THREE.PlaneGeometry(7500, 7500, 100, 100);
  sandPlane.rotateX(-Math.PI / 2);

  const circle = new THREE.SphereGeometry(100, 32, 32);
  const circleMaterial = new THREE.MeshPhongMaterial({
    color: 0xfacade,
  });
  circleMesh = new THREE.Mesh(circle, circleMaterial);
  circleMesh.position.set(0, 500, 0);
  circleMesh.rotation.x = Math.PI / 2;
  scene.add(circleMesh);

  waterMesh = new THREE.Mesh(
    new THREE.BoxGeometry(7500, 2500, 7500),
    new THREE.MeshPhongMaterial({
      color: 0x00aaff,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    })
  );
  waterMesh.position.set(0, 1200, 0);
  waterBox = createCollisionBox(waterMesh);
  const waterHelper = new THREE.Box3Helper(waterBox, 0x00aaff);
  scene.add(waterHelper);
  scene.add(waterMesh);

  circleBox = createCollisionBox(circleMesh);
  const helper = new THREE.Box3Helper(circleBox, 0xffff00);
  scene.add(helper);

  const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 5);
  scene.add(light);
  sandMesh = new THREE.Mesh(
    sandPlane,
    new THREE.MeshBasicMaterial({ color: 0xfcf6c3 })
  );
  scene.add(sandMesh);

  container.addEventListener("pointermove", onPointerMove);

  /*stats = new Stats();
  container.appendChild(stats.dom);*/

  window.addEventListener("resize", onWindowResize);

  document.addEventListener("keydown", (e) => {
    if (e.key === "w") {
      movement.up = true;
    }
    if (e.key === "s") {
      movement.down = true;
    }
    if (e.key === "a") {
      movement.left = true;
    }
    if (e.key === "d") {
      movement.right = true;
    }
    if (e.key === "q") {
      movement.ascend = true;
    }
    if (e.key == "e") {
      movement.descend = true;
    }
  });

  document.addEventListener("keyup", (e) => {
    if (e.key === "w") {
      movement.up = false;
    }
    if (e.key === "s") {
      movement.down = false;
    }
    if (e.key === "a") {
      movement.left = false;
    }
    if (e.key === "d") {
      movement.right = false;
    }
    if (e.key === "q") {
      movement.ascend = false;
    }
    if (e.key == "e") {
      movement.descend = false;
    }
  });
}

function onWindowResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(): void {
  const circleSpeedX = 5;
  const circleSpeedY = 5;
  const circleSpeedZ = 5;

  const cameraSpeedX = 5;
  const cameraSpeedY = 5;
  const cameraSpeedZ = 5;

  if (movement.up) {
    circleMesh.translateY(-circleSpeedY);
    camera.translateZ(-cameraSpeedZ);
  }
  if (movement.down) {
    circleMesh.translateY(circleSpeedY);
    camera.translateZ(cameraSpeedZ);
  }
  if (movement.left) {
    circleMesh.translateX(-circleSpeedX);
    camera.translateX(-cameraSpeedX);
  }
  if (movement.right) {
    circleMesh.translateX(circleSpeedX);
    camera.translateX(cameraSpeedX);
  }
  if (movement.ascend) {
    circleMesh.translateZ(-circleSpeedZ);
    camera.translateY(cameraSpeedY);
  }
  if (movement.descend) {
    circleMesh.translateZ(circleSpeedZ);
    camera.translateY(-cameraSpeedY);
  }

  checkUnderwaterEffect(circleMesh, waterBox);
  normalize(circleMesh.position);

  renderScene();
  //stats.update();
}

function renderScene(): void {
  //checks if the circle intersects with the sand
  if (
    circleBox
      .setFromObject(circleMesh)
      .intersectsBox(createCollisionBox(sandMesh))
  ) {
    circleMesh.position.y = maxFromGround;
    //camera needs to adjust to the same position and zoom as the circle
    //camera.position.y = circleMesh.position.y;
    camera.position.set(
      circleMesh.position.x,
      circleMesh.position.y,
      circleMesh.position.z + unitsAwayCamera
    );
  }
  renderer.render(scene, camera);
}

function onPointerMove(event: PointerEvent): void {
  pointer.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  pointer.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
  /* raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObject(mesh);
  if (intersects.length > 0) {
    helper.position.copy(intersects[0].point);
    helper.lookAt(intersects[0].face!.normal);
  } */
}

function normalize(v: THREE.Vector3): THREE.Vector3 {
  const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  if (length > 0) {
    return new THREE.Vector3(v.x / length, v.y / length, v.z / length);
  }
  return new THREE.Vector3(0, 0, 0);
}

//function based on https://www.youtube.com/watch?v=9H3HPq-BTMo
function createCollisionBox(mesh: THREE.Mesh): THREE.Box3 {
  const box = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
  box.setFromObject(mesh);
  return box;
}

//given by GPT asking about how to keep a box inside another box
function checkUnderwaterEffect(playerMesh: THREE.Mesh, box: THREE.Box3): void {
  const playerPosition = playerMesh.position;
  if (box.containsPoint(playerPosition)) {
    return;
  } else {
    box.clampPoint(playerMesh.position, playerMesh.position);
    box.clampPoint(camera.position, camera.position);
  }
}
