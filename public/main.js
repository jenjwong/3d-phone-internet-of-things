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

// Setup 3D scene
function setupScene() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, $renderPort.width()/$renderPort.height(), 0.1, 1000);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( $renderPort.width(), $renderPort.height() );
  $renderPort.append( renderer.domElement );
  camera.position.z = 5;
}

function addCube() {
  var geometry = new THREE.BoxGeometry( 1,1,1 );
  var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 });
  cube = new THREE.Mesh( geometry, material );
  scene.add( cube );
}

var render = function () {
  requestAnimationFrame( render );
  // cube.rotation.x = alpha;
  // cube.rotation.y = beta;
  // cube.rotation.z = gamma;
  cube.position.x = sX;
  cube.position.y = sY;
  cube.position.z = sZ;
  
  renderer.render( scene, camera );
}

// Kickstart
setupScene();
addCube();
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
  vX = data.velocity.vX;
  vY = data.velocity.vY;
  vZ = data.velocity.vZ;
  
  sX = data.displacement.sX;
  sY = data.displacement.sY;
  sZ = data.displacement.sZ;
  
  alpha = data.rotationRate.alpha;
  beta = data.rotationRate.beta;
  gamma = data.rotationRate.gamma;
});