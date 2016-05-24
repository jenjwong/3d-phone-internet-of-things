// jQuery
var $renderPort = $('#renderPort');

// SocketIO
var socket = io();
var connected = false;

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
  cube.rotation.x += 0.1;
  cube.rotation.y += 0.1;
  
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
      interval: data.interval
    };
    socket.emit('phone-data', phoneData);
  }, false);
}

socket.on('phone-data', function (data) {
  console.log(data.velocity.vX);
});