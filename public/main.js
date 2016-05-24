// jQuery
var $renderPort = $('#renderPort');

// SocketIO
var socket = io();
var connected = false;

// Phone variables
var vX = 0, vY = 0, vZ = 0,
  sX = 0, sY = 0, sZ = 0,
  alpha = 0, beta = 0, gamma = 0;

// 3D Scene variables
var scene, camera, renderer, cube;
var ambientlight, hemispherelight, dirlight, pointlight;

// Setup 3D scene
function setupScene() {
  // Scene object
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, $renderPort.width()/$renderPort.height(), 0.1, 1000);
  
  // Create renderer
  renderer = new THREE.WebGLRenderer( { alpha: true } );
  renderer.setSize( $renderPort.width(), $renderPort.height());
  
  // Light
  ambientlight = new THREE.AmbientLight( 0x404040 );
  scene.add( ambientlight );
  
  dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(100, 500, 50);
  scene.add(dirLight);
  
  hemispherelight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
  hemispherelight.position.set(0, 500, 0);
  hemispherelight.color.setHSL( 0.6, 1, 0.6 );
  hemispherelight.groundColor.setHSL( 0.095, 1, 0.75 );
  scene.add( hemispherelight );
  
  // Add renderer
  $renderPort.append( renderer.domElement );
  
  // Cam position
  camera.position.z = 300;
  camera.position.y = 300;
  
  // Add cube
  addCube();
  
  camera.lookAt( cube.position );
}

function addCube() {
  var geometry = new THREE.BoxGeometry( 100,100,100 );
  var material = new THREE.MeshPhongMaterial( { color: 0x47d1d1 });
  cube = new THREE.Mesh( geometry, material );
  cube.castShadow = true;
  scene.add( cube );
}

var render = function () {
  requestAnimationFrame( render );
  cube.rotation.x = alpha;
  cube.rotation.y = beta;
  cube.rotation.z = gamma;
  
  renderer.render( scene, camera );
}

// Kickstart
setupScene();
render();

// Check connection
socket.on('connection', function() {
  connected = true;
});

// If client has accelerometer and gyro data
if (window.DeviceMotionEvent) {
  window.addEventListener('devicemotion', function (data) {
    var acc = data.acceleration;
    // vel and displacement yet
    var phoneData = {
      accelerometer: acc,
      velocity: {},
      displacement: {},
      rotationRate: data.rotationRate,
      interval: data.interval
    };
    socket.emit('phone-data', phoneData);
  }, false);
}

socket.on('phone-data', function (data) {
  // Update velocity
  vX = data.velocity.vX;
  vY = data.velocity.vY;
  vZ = data.velocity.vZ;
  
  // Update displacement
  sX = data.displacement.sX;
  sY = data.displacement.sY;
  sZ = data.displacement.sZ;
  
  if (Math.abs(data.rotationRate.alpha) > 0.2 || Math.abs(data.rotationRate.beta) > 0.2 || Math.abs(data.rotationRate.gamma) > 0.2){
    // Update rotationRate
    var scalar = 1000;
    alpha = data.rotationRate.alpha*data.interval;
    beta = data.rotationRate.beta*data.interval;
    gamma = data.rotationRate.gamma*data.interval;
  }
});