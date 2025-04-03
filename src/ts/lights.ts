//taken from https://github.com/mrdoob/three.js/blob/master/examples/webgl_geometry_terrain_raycast.html
import * as THREE from "three";
//import Stats from "three/examples/jsm/libs/stats.module.js";
//import { ImprovedNoise, OrbitControls } from "three/examples/jsm/Addons.js";
//import { OrbitControls } from "three/examples/jsm/Addons.js";

let container: HTMLDivElement;
//let stats: Stats;
let camera: THREE.PerspectiveCamera,
  //controls: OrbitControls,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer;
let mesh: THREE.Mesh;
let circleMesh: THREE.Mesh;
//let texture: THREE.Texture;
//let helper: THREE.Mesh;
//const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const movement = {
  up: false,
  down: false,
  left: false,
  right: false,
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
    80,
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
  const geometry = new THREE.PlaneGeometry(7500, 7500, 100, 100);
  geometry.rotateX(-Math.PI / 2);

  const circle = new THREE.SphereGeometry(100, 32, 32);
  const circleMaterial = new THREE.MeshPhongMaterial({
    color: 0xfacade,
  });
  circleMesh = new THREE.Mesh(circle, circleMaterial);
  circleMesh.position.set(0, 500, 0);
  circleMesh.rotation.x = Math.PI / 2;
  scene.add(circleMesh);

  const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 5);
  scene.add(light);
  mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ color: 0xfcf6c3 })
  );
  scene.add(mesh);

  container.addEventListener("pointermove", onPointerMove);

  /*stats = new Stats();
  container.appendChild(stats.dom);*/

  window.addEventListener("resize", onWindowResize);

  //const keyPressed = false;

  /*document.addEventListener(
    "keydown",
    (e) => {
      if (!keyPressed) {
        keyPressed = true;
        moveMesh(circleMesh, e, keyPressed);
      }
    },
    false
  );

  document.addEventListener(
    "keyup",
    (e) => {
      keyPressed = false;
      moveMesh(circleMesh, e, keyPressed);
    },
    false
  ); */

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
  });
}

function onWindowResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/*function generateHeight(width: number, height: number): Uint8Array {
  const size = width * height;
  const data = new Uint8Array(size);
  const perlin = new ImprovedNoise();
  const z = Math.random() * 100;
  let quality = 1;

  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < size; i++) {
      const x = i % width;
      const y = ~~(i / width);
      data[i] += Math.abs(
        perlin.noise(x / quality, y / quality, z) * quality * 1.75
      );
    }
    quality *= 5;
  }

  return data;
} */

/*function generateTexture(
  data: Uint8Array,
  width: number,
  height: number
): HTMLCanvasElement {
  let context: CanvasRenderingContext2D | null = null;
  let image: ImageData | null = null;
  let imageData: Uint8ClampedArray | null = null;
  let shade: number;
  const vector3 = new THREE.Vector3(0, 0, 0);
  const sun = new THREE.Vector3(1, 1, 1).normalize();

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  context = canvas.getContext("2d")!;
  context.fillStyle = "#000";
  context.fillRect(0, 0, width, height);

  image = context.getImageData(0, 0, canvas.width, canvas.height);
  imageData = image.data;

  for (let i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {
    vector3
      .set(
        data[j - 2] - data[j + 2],
        2,
        data[j - width * 2] - data[j + width * 2]
      )
      .normalize();
    shade = vector3.dot(sun);

    imageData[i] = (96 + shade * 128) * (0.5 + data[j] * 0.007);
    imageData[i + 1] = (32 + shade * 96) * (0.5 + data[j] * 0.007);
    imageData[i + 2] = shade * 96 * (0.5 + data[j] * 0.007);
  }

  context.putImageData(image, 0, 0);
  return canvas;
} */

function animate(): void {
  if (movement.up) {
    circleMesh.translateY(-1);
  }
  if (movement.down) {
    circleMesh.translateY(1);
  }
  if (movement.left) {
    circleMesh.translateX(-1);
  }
  if (movement.right) {
    circleMesh.translateX(1);
  }

  normalize(circleMesh.position);

  render();
  //stats.update();
}

function render(): void {
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
