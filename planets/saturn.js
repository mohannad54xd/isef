import * as THREE from "three";
import { OrbitControls } from 'jsm/controls/OrbitControls.js';

import getStarfield from "./src/getStarfield.js";
import { getFresnelMat } from "./src/getFresnelMat.js";

let w = window.innerWidth;
let h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5;
camera.position.y = 2;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

// Set tone mapping and color space
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.maxDistance = 350;
controls.minDistance = 20;
controls.enablePan = false;
// Dynamic resize handling (media query logic)
function onResize() {
w = window.innerWidth;
h = window.innerHeight;

// Update renderer size
renderer.setSize(w, h);

// Update camera aspect ratio
camera.aspect = w / h;
camera.updateProjectionMatrix();

// Optional: Adjust controls or scene elements
if (w < 768) {
  // For mobile or small screens
  camera.fov = 85; // Increase field of view
  controls.minDistance = 5;
  controls.maxDistance = 200;
} else if (w < 1200) {
  // For tablets
  camera.fov = 75;
  controls.minDistance = 10;
  controls.maxDistance = 300;
} else {
  // For desktop
  camera.fov = 65;
  controls.minDistance = 5;
  controls.maxDistance = 350;
}
camera.updateProjectionMatrix();
}
// Add event listener for resize
window.addEventListener('resize', onResize);

// Initial call to adjust settings based on the current window size
onResize();

const saturnGroup = new THREE.Group();
saturnGroup.rotation.z = -23.4 * Math.PI / 180;
scene.add(saturnGroup);
const detail = 12;
const loader = new THREE.TextureLoader();
const geometry = new THREE.IcosahedronGeometry(1, detail);
const material = new THREE.MeshPhongMaterial({
  map: loader.load("https://static.vecteezy.com/system/resources/previews/002/284/795/non_2x/abstract-background-of-saturn-surface-vector.jpg"),
  bumpScale: 0.04,
});
// material.map.colorSpace = THREE.SRGBColorSpace;
const saturnMesh = new THREE.Mesh(geometry, material);
saturnGroup.add(saturnMesh);



const fresnelMat = getFresnelMat({rimHex : "#E9EAE0"});
const glowMesh = new THREE.Mesh(geometry, fresnelMat);
glowMesh.scale.setScalar(1.01);
saturnGroup.add(glowMesh);

const stars = getStarfield({numStars: 2000});
scene.add(stars);

const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
sunLight.position.set(-2, 0.5, 1.5).normalize();
scene.add(sunLight);

// Load the ring texture
const ringTexture = loader.load("https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/5087affb-58e1-4a81-bc50-8138600a6453/d4xautd-ad5389d8-42e7-4a7f-b237-4257bed7c17d.png/v1/fill/w_800,h_800/saturn_s_rings_stock_image_by_alpha_element_d4xautd-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9ODAwIiwicGF0aCI6IlwvZlwvNTA4N2FmZmItNThlMS00YTgxLWJjNTAtODEzODYwMGE2NDUzXC9kNHhhdXRkLWFkNTM4OWQ4LTQyZTctNGE3Zi1iMjM3LTQyNTdiZWQ3YzE3ZC5wbmciLCJ3aWR0aCI6Ijw9ODAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.bcN3MrTNIUUBZ_F4cUreJ_QJgptgnp-0gAijWC7U89s");

// Set ring dimensions
const innerRadius = 1.2; // Slightly larger than Saturn's radius
const outerRadius = 2.5;

// Create ring geometry
const ringGeo = new THREE.RingGeometry(innerRadius, outerRadius, 64);

// Create ring material
const ringMat = new THREE.MeshBasicMaterial({
  map: ringTexture,
  side: THREE.DoubleSide,
  transparent: true, // Allow for transparency in the ring texture
  opacity: 0.8, // Adjust as needed
});

// Create the ring mesh and add it to the scene
const ringMesh = new THREE.Mesh(ringGeo, ringMat);
ringMesh.position.set(0, 0, 0); // Center the ring around Saturn
ringMesh.rotation.x = -0.5 * Math.PI; // Align the ring horizontally

// Add ring to the Saturn group
saturnGroup.add(ringMesh);


function animate() {
  requestAnimationFrame(animate);

  saturnMesh.rotation.y += 0.002;
  glowMesh.rotation.y += 0.002;
  ringMesh.rotation.z += 0.002 ;
  stars.rotation.y -= 0.0002;
  renderer.render(scene, camera);
}

animate();

function handleWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);