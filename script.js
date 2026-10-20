
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

// CONTENEDOR
const contenedor = document.getElementById("contenedor3d");

if (!contenedor) {
    throw new Error("No se encontro el contenedor3d.");
}

// ESCENA TRANSPARENTE
const scene = new THREE.Scene();
scene.background = null;

// CAMARA
const camera = new THREE.PerspectiveCamera(
    45,
    contenedor.clientWidth / contenedor.clientHeight,
    0.1,
    1000
);

camera.position.set(0, 2.5, 7);

// RENDERIZADOR
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(contenedor.clientWidth, contenedor.clientHeight);
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Evitar que el modelo se sobreexponga
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.domElement.style.background = "transparent";
contenedor.appendChild(renderer.domElement);

// CONTROLES
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableRotate = true;
controls.enableZoom = true;
controls.enablePan = false;
controls.target.set(0, 1.8, 0);
controls.update();

// ILUMINACION EQUILIBRADA
const luzAmbiente = new THREE.AmbientLight(0xffffff, 2.5);
scene.add(luzAmbiente);

// Luz frontal principal
const luzPrincipal = new THREE.DirectionalLight(0xffffff, 5.5);
luzPrincipal.position.set(3, 8, 10);
luzPrincipal.castShadow = true;
scene.add(luzPrincipal);

// Luz frontal suave para iluminar el rostro
const luzFrontal = new THREE.PointLight(0xffffff, 50, 25);
luzFrontal.position.set(0, 4, 7);
scene.add(luzFrontal);

// Luz violeta lateral
const luzVioleta = new THREE.PointLight(0x9d7cff, 12, 25);
luzVioleta.position.set(-5, 4, 2);
scene.add(luzVioleta);

// Luz azul de contorno
const luzAzul = new THREE.PointLight(0x66ccff, 8, 25);
luzAzul.position.set(5, 4, -3);
scene.add(luzAzul);

// COMPOSITOR DE POSTPROCESAMIENTO
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

// EFECTO 1: BLOOM SUAVE
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(
        contenedor.clientWidth,
        contenedor.clientHeight
    ),
    0.12,  // Intensidad
    0.2,   // Radio
    0.95   // Umbral alto para proteger los detalles
);

composer.addPass(bloomPass);

// EFECTO 2: ABERRACION CROMATICA SUAVE
const cinematicShader = {
    uniforms: {
        tDiffuse: { value: null },
        aberration: { value: 0.00045 }
    },

    vertexShader: `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix *
                modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float aberration;
        varying vec2 vUv;

        void main() {
            vec2 centro = vUv - vec2(0.5);
            float distancia = length(centro);

            vec2 desplazamiento =
                centro * aberration * (1.0 + distancia);

            vec4 original = texture2D(tDiffuse, vUv);

            float rojo = texture2D(
                tDiffuse, vUv + desplazamiento
            ).r;

            float verde = original.g;

            float azul = texture2D(
                tDiffuse, vUv - desplazamiento
            ).b;

            vec3 color = vec3(rojo, verde, azul);

            // Mantener la transparencia original
            gl_FragColor = vec4(color, original.a);
        }
    `
};

const cinematicPass = new ShaderPass(cinematicShader);
composer.addPass(cinematicPass);

// PASO FINAL: RESTAURAR TRANSPARENCIA
// El fondo negro generado por el compositor se hace transparente.
const transparenciaShader = {
    uniforms: {
        tDiffuse: { value: null }
    },

    vertexShader: `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix *
                modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: `
        uniform sampler2D tDiffuse;
        varying vec2 vUv;

        void main() {
            vec4 color = texture2D(tDiffuse, vUv);

            // Los pixeles negros del fondo se vuelven transparentes.
            float luminosidad = max(
                color.r,
                max(color.g, color.b)
            );

            float alpha = smoothstep(
                0.015, 0.10, luminosidad
            );

            gl_FragColor = vec4(color.rgb, alpha);
        }
    `
};

const transparenciaPass = new ShaderPass(transparenciaShader);
composer.addPass(transparenciaPass);

// CARGAR MODELO 3D
const loader = new GLTFLoader();
let modelo = null;

loader.load(
    "virgen.glb",

    function (gltf) {
        modelo = gltf.scene;

        modelo.scale.set(5.2, 5.2, 5.2);
        modelo.position.set(0, 2.1, 0);
        modelo.rotation.y = -Math.PI / 2;

        modelo.traverse(function (obj) {
            if (!obj.isMesh) return;

            obj.castShadow = true;
            obj.receiveShadow = true;

            // Ajustes conservadores para conservar el material original
            const materiales = Array.isArray(obj.material)
                ? obj.material
                : [obj.material];

            materiales.forEach(function (material) {
                if (material && material.isMeshStandardMaterial) {
                    material.roughness = Math.max(
                        material.roughness,
                        0.4
                    );

                    material.needsUpdate = true;
                }
            });
        });

        scene.add(modelo);
        console.log("virgen.glb cargado correctamente.");
    },

    function (xhr) {
        if (xhr.total) {
            console.log(
                "Carga: " +
                Math.round(xhr.loaded / xhr.total * 100) +
                "%"
            );
        }
    },

    function (error) {
        console.error("Error al cargar virgen.glb:", error);
    }
);

// ANIMACION
function animate() {
    requestAnimationFrame(animate);

    if (modelo) {
        modelo.rotation.y += 0.002;
    }

    controls.update();
    composer.render();
}

animate();

// REDIMENSIONAR
function redimensionar() {
    const ancho = contenedor.clientWidth;
    const alto = contenedor.clientHeight;

    if (!ancho || !alto) return;

    camera.aspect = ancho / alto;
    camera.updateProjectionMatrix();

    renderer.setSize(ancho, alto);
    composer.setSize(ancho, alto);
    bloomPass.setSize(ancho, alto);
}

window.addEventListener("resize", redimensionar);
