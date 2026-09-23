/*IMPORTAR THREE.JS */
import * as THREE from "three";
import {
    OrbitControls
} from "three/addons/controls/OrbitControls.js";
import {
    GLTFLoader
} from "three/addons/loaders/GLTFLoader.js";

/* CONTENEDOR DEL MODELO */
const contenedor =
    document.getElementById("contenedor3d");

/* ESCENA */
const scene = new THREE.Scene();
scene.background = null;

/* CÁMARA */
const camera =
    new THREE.PerspectiveCamera(
        45,
        contenedor.clientWidth /
        contenedor.clientHeight,
        0.1,
        1000
    );

camera.position.set(
    0,
    2.5,
    7
);

/* RENDERIZADOR */
const renderer =
    new THREE.WebGLRenderer({
        antialias:true,
        alpha:true

    });

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);
renderer.setSize(
    contenedor.clientWidth,
    contenedor.clientHeight
);

renderer.shadowMap.enabled = true;
/* Agregar el canvas */

contenedor.appendChild(
    renderer.domElement
);
/* -------------------CONTROLES*/
const controls =
    new OrbitControls(
        camera,
        renderer.domElement
    );

controls.enableDamping = true;
controls.enableRotate = true;
controls.enableZoom = true;
controls.enablePan = false;
controls.target.set(
    0,
    1.8,
    0
);
controls.update()
/* ===================LUZ */

const ambient =
    new THREE.AmbientLight(
        0xffffff,
        4
    );

scene.add(ambient);


const dirLight =
    new THREE.DirectionalLight(
        0xffffff,
        5
    );


dirLight.position.set(
    5,
    10,
    7
);


dirLight.castShadow = true;

scene.add(dirLight);


const light2 =
    new THREE.PointLight(
        0x9d7cff,
        20
    );


light2.position.set(
    -5,
    3,
    5
);

scene.add(light2);


const light3 =
    new THREE.PointLight(
        0xffffff,
        15
    );


light3.position.set(
    5,
    4,
    -5
);
scene.add(light3);

/* ========= CARGAR MODELO 3D */

const loader =
    new GLTFLoader();
let modelo = null;

loader.load(
    "virgen.glb",
    function(gltf){
        modelo =
            gltf.scene;
        /* Tamaño */
        modelo.scale.set(
            5.2,5.2,5.2);

        /* Posición */
        modelo.position.set(
            0,
            2.1,
            0
        );


        /* Rotación inicial */

        modelo.rotation.y =
            -Math.PI / 2;


        /* Sombras */

        modelo.traverse(
            function(obj){

                if(obj.isMesh){

                    obj.castShadow = true;

                    obj.receiveShadow = true;

                }

            }
        );


        /* Agregar a la escena */

        scene.add(modelo);


        console.log(
            "Virgen cargada"
        );

    },


    /* PROGRESO */

    function(xhr){

        if(xhr.total){

            console.log(
                "Modelo: " +
                Math.round(
                    xhr.loaded /
                    xhr.total *
                    100
                ) +
                "%"
            );

        }

    },


    /* ERROR */

    function(error){

        console.error(
            "Error cargando frentevirgen.glb:",
            error
        );

    }

);

/* =========================================
   ANIMACIÓN
========================================= */
function animate(){
    requestAnimationFrame(
        animate
    );
    if(modelo){
        modelo.rotation.y += 0.003;

    }


    controls.update();


    renderer.render(
        scene,
        camera
    );

}

animate();



/* =========================================
   REDIMENSIONAR
========================================= */

window.addEventListener(
    "resize",
    function(){

        const ancho =
            contenedor.clientWidth;

        const alto =
            contenedor.clientHeight;


        camera.aspect =
            ancho / alto;


        camera.updateProjectionMatrix();


        renderer.setSize(
            ancho,
            alto
        );

    }
);



/* =========================================
   VENTANA DE UBICACIÓN
========================================= */

const btnUbicacion =
    document.getElementById(
        "btnUbicacion"
    );


const ventanaUbicacion =
    document.getElementById(
        "ventanaUbicacion"
    );


const cerrarUbicacion =
    document.getElementById(
        "cerrarUbicacion"
    );



/* Abrir ubicación */

btnUbicacion.addEventListener(
    "click",
    function(event){

        event.preventDefault();


        ventanaUbicacion.classList.add(
            "mostrar"
        );


        ventanaContacto.classList.remove(
            "mostrar"
        );

    }
);



/* Cerrar ubicación */
cerrarUbicacion.addEventListener(
    "click",
    function(){
        ventanaUbicacion.classList.remove(
            "mostrar"
        );

    }
);


/* =========================================
   VENTANA DE CONTACTO
========================================= */
const btnContacto =
    document.getElementById(
        "btnContacto"
    );


const ventanaContacto =
    document.getElementById(
        "ventanaContacto"
    );

const cerrarContacto =
    document.getElementById(
        "cerrarContacto"
    );



/* Abrir contacto */

btnContacto.addEventListener(
    "click",
    function(event){

        event.preventDefault();


        ventanaContacto.classList.add(
            "mostrar"
        );


        ventanaUbicacion.classList.remove(
            "mostrar"
        );

    }
);



/* Cerrar contacto */

cerrarContacto.addEventListener(
    "click",
    function(){

        ventanaContacto.classList.remove(
            "mostrar"
        );

    }
);
