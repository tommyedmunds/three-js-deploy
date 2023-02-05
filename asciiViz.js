const noise = new SimplexNoise();

let count = 0;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  120,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
//scene.background = texture;

let selectedShape;

let widthSegments = 10;
let heightSegments = 1;

let widthLimit = 13;
let heightLimit = 2;

let effect;
const renderer = new THREE.WebGLRenderer({ antiailas: true });
renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

effect = new THREE.AsciiEffect(renderer, ' .:-+*=%@#', { invert: true });
effect.setSize(window.innerWidth, window.innerHeight);
effect.domElement.style.color = 'white';
effect.domElement.style.backgroundColor = 'black';
document.body.appendChild(effect.domElement);

const controls = new THREE.OrbitControls(camera, effect.domElement);
camera.position.set(5, 2, 5);

// create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add(listener);

controls.update();
const sound = new THREE.Audio(listener);

// create an Audio source

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load('assets/bourgeoisie.mp3', function (buffer) {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.5);
});

const analyser = new THREE.AudioAnalyser(sound);
analyser.fftSize = 1024;

function loadAudio() {
  // get the average frequency of the sound
  const data = analyser.getAverageFrequency();
  const bufferLength = analyser.analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  return dataArray;
}

const dataArray = loadAudio();
let clicked = false;
document.addEventListener('click', (e) => {
  console.log(e.clientX, e.clientY, screen.height);
  if (e.clientX >= screen.height * 0.95)
    if (!clicked) {
      sound.play();
      clicked = true;
    } else {
      sound.pause();
      clicked = false;
    }
});

const shapeArr = [];

const geometry = new THREE.BoxGeometry(15, 12, 15);
const material = new THREE.MeshNormalMaterial({ wireframe: true });
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);
//console.log(THREE);

controls.autoRotate = true;
//console.log(scene.children);
const childrenLengthOnInit = scene.children.length;
const pushed = true;
function animate() {
  requestAnimationFrame(animate);

  // on a range from 0 - 255
  const avgFreq = analyser.getAverageFrequency(dataArray);
  const upperFreq = analyser.getAverageFrequency(
    dataArray.slice(0, dataArray.length / 2)
  );
  if ((clicked && pushed) || avgFreq > 0) {
    makeRoughShape(sphere, avgFreq);
  }
  controls.update();
  effect.render(scene, camera);
}

function makeRoughShape(mesh, fr) {
  const normalizedFR = (fr * 10) / 255;
  mesh.geometry.vertices.forEach(function (vertex, i) {
    if (clicked) {
      if (normalizedFR > 0) {
        var offset = mesh.geometry.parameters.radius;
        var amp = 2.8;
        var time = window.performance.now();
        var rf = 0.00004;
        vertex.normalize();
        var distance = offset + amp * normalizedFR;
        vertex.multiplyScalar(
          distance *
            noise.noise2D(
              vertex.x + time * rf * 7,
              vertex.y + time * rf * 8,
              vertex.z + time * rf * 9
            )
        );
      }
    } else {
      vertex.normalize(2);
    }
  });
  mesh.geometry.verticesNeedUpdate = true;
  mesh.geometry.normalsNeedUpdate = true;
  mesh.geometry.computeVertexNormals();
  mesh.geometry.computeFaceNormals();
}

// function makeRoughShape(mesh, fr) {
//   const normalizedFR = (fr * 10) / 255;
//   mesh.geometry.vertices.forEach(function (vertex, i) {
//     if (clicked) {
//       if (normalizedFR > 0) {
//         var offset = mesh.geometry.parameters.radius;
//         var amp = 2.8;
//         var time = window.performance.now();
//         var rf = 0.00004;
//         vertex.normalize();
//         var distance = offset + amp * normalizedFR;
//         vertex.multiplyScalar(
//           distance *
//             noise.noise2D(
//               vertex.x + time * rf * 7,
//               vertex.y + time * rf * 8,
//               vertex.z + time * rf * 9
//             )
//         );
//       }
//     } else {
//       vertex.normalize(2);
//     }
//   });
//   mesh.geometry.verticesNeedUpdate = true;
//   mesh.geometry.normalsNeedUpdate = true;
//   mesh.geometry.computeVertexNormals();
//   mesh.geometry.computeFaceNormals();
// }

animate();
