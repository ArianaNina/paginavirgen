import*as THREE from"three";
import{OrbitControls}from"three/addons/controls/OrbitControls.js";
import{GLTFLoader}from"three/addons/loaders/GLTFLoader.js";

// CONTENEDOR
const contenedor=document.getElementById("contenedor3d");

// ESCENA
const scene=new THREE.Scene();
scene.background=null;

// CAMARA
const camera=new THREE.PerspectiveCamera(45,contenedor.clientWidth/contenedor.clientHeight,0.1,1000);
camera.position.set(0,2.5,7);

// RENDER
const renderer=new THREE.WebGLRenderer({
antialias:true,
alpha:true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.setSize(contenedor.clientWidth,contenedor.clientHeight);
renderer.shadowMap.enabled=true;
contenedor.appendChild(renderer.domElement);

// CONTROLES
const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;
controls.enableRotate=true;
controls.enableZoom=true;
controls.enablePan=false;
controls.target.set(0,1.8,0);
controls.update();

// LUZ
const ambient=new THREE.AmbientLight(0xffffff,4);
scene.add(ambient);

const dirLight=new THREE.DirectionalLight(0xffffff,5);
dirLight.position.set(5,10,7);
dirLight.castShadow=true;
scene.add(dirLight);

const light2=new THREE.PointLight(0x9d7cff,20);
light2.position.set(-5,3,5);
scene.add(light2);

const light3=new THREE.PointLight(0xffffff,15);
light3.position.set(5,4,-5);
scene.add(light3);

// MODELO
const loader=new GLTFLoader();
let modelo=null;

loader.load(
"frentevirgen.glb",
function(gltf){
modelo=gltf.scene;
modelo.scale.set(5,5,5);
modelo.position.set(0,2.4,0);
modelo.rotation.y=-Math.PI/2;
modelo.traverse(function(obj){
if(obj.isMesh){
obj.castShadow=true;
obj.receiveShadow=true;
}
});
scene.add(modelo);
console.log("Virgen cargada");
},
function(xhr){
if(xhr.total){
console.log("Modelo:"+Math.round(xhr.loaded/xhr.total*100)+"%");
}
},
function(error){
console.error("Error cargando frentevirgen.glb:",error);
}
);

// ANIMACION
function animate(){
requestAnimationFrame(animate);
if(modelo){
modelo.rotation.y+=0.003;
}
controls.update();
renderer.render(scene,camera);
}
animate();

// REDIMENSIONAR
window.addEventListener("resize",function(){
const ancho=contenedor.clientWidth;
const alto=contenedor.clientHeight;
camera.aspect=ancho/alto;
camera.updateProjectionMatrix();
renderer.setSize(ancho,alto);
});