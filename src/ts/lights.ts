//taken from https://github.com/mrdoob/three.js/blob/master/examples/webgl_geometry_terrain_raycast.html
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { ImprovedNoise, OrbitControls } from "three/examples/jsm/Addons.js";

let container: HTMLDivElement;
let stats: Stats;
let camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer;
let mesh: THREE.Mesh, texture: THREE.Texture;
let helper: THREE.Mesh;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const worldWidth = 512,
  worldDepth = 128;
const worldHalfWidth = worldWidth / 2,
  worldHalfDepth = worldDepth / 2;

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
    60,
    window.innerWidth / window.innerHeight,
    10,
    20000
  );

  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 1000;
  controls.maxDistance = 10000;
  controls.maxPolarAngle = Math.PI / 2;

  const data = generateHeight(worldWidth, worldDepth);

  controls.target.y = data[worldHalfWidth + worldHalfDepth * worldWidth] + 500;
  camera.position.set(2000, controls.target.y + 2000, 0);
  controls.update();

  const geometry = new THREE.PlaneGeometry(
    7500,
    7500,
    worldWidth - 1,
    worldDepth - 1
  );
  geometry.rotateX(-Math.PI / 2);

  const vertices = geometry.attributes.position.array as Float32Array;
  for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
    vertices[j + 1] = data[i] * 10;
  }

  texture = new THREE.CanvasTexture(
    generateTexture(data, worldWidth, worldDepth)
  );
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ map: texture })
  );
  scene.add(mesh);

  const geometryHelper = new THREE.ConeGeometry(20, 100, 3);
  geometryHelper.translate(0, 50, 0);
  geometryHelper.rotateX(Math.PI / 2);
  helper = new THREE.Mesh(geometryHelper, new THREE.MeshNormalMaterial());
  scene.add(helper);

  container.addEventListener("pointermove", onPointerMove);

  stats = new Stats();
  container.appendChild(stats.dom);

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function generateHeight(width: number, height: number): Uint8Array {
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
}

function generateTexture(
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
}

function animate(): void {
  render();
  stats.update();
}

function render(): void {
  renderer.render(scene, camera);
}

function onPointerMove(event: PointerEvent): void {
  pointer.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  pointer.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObject(mesh);
  if (intersects.length > 0) {
    helper.position.copy(intersects[0].point);
    helper.lookAt(intersects[0].face!.normal);
  }
}
