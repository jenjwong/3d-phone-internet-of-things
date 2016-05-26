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
  dirLight.position.set(400, 500, 50);
  scene.add(dirLight);
  
  hemispherelight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
  hemispherelight.position.set(0, 500, 0);
  hemispherelight.color.setHSL( 0.6, 1, 0.6 );
  hemispherelight.groundColor.setHSL( 0.095, 1, 0.75 );
  scene.add( hemispherelight );
  
  // Add renderer
  $renderPort.append( renderer.domElement );
  
  // Cam position
  camera.position.z = 400;
  camera.position.y = 400;
  // camera.up = new THREE.Vector3( 0, 0, 1 );
  
  // Add cube
  addCube();
  
  camera.lookAt( cube.position );
  scene.add( camera );
}

function addCube() {
  var geometry = new THREE.BoxGeometry( 300,300,300 );
  var material = new THREE.MeshPhongMaterial( { color: 0x47d1d1 });
  cube = new THREE.Mesh( geometry, material );
  cube.castShadow = true;
  scene.add( cube );
}

var render = function () {
  cube.rotation.x += beta;
  cube.rotation.y += gamma;
  cube.rotation.z += alpha;
  
  requestAnimationFrame( render );
  renderer.render( scene, camera );
}

window.addEventListener('resize', function() {
  renderer.setSize( $renderPort.width(), $renderPort.height());
  camera.aspect = $renderPort.width()/$renderPort.height();
  camera.updateProjectionMatrix();
});

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
    var vel = { vX: vX, vY: vY, vZ: vZ };
    var disp = { sX: sX, sY: sY, sZ: sZ };
    
    var phoneData = {
      accelerometer: acc,
      velocity: vel,
      displacement: disp,
      rotationRate: data.rotationRate,
      interval: data.interval
    };
    
    // Tell server 
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
  
  // Check and update angle
  if (aboveAbsThreshold(data.rotationRate.alpha, 0.1) || aboveAbsThreshold(data.rotationRate.beta, 0.1) || aboveAbsThreshold(data.rotationRate.gamma, 0.1)) {
    var scalar = 100;
    alpha = data.rotationRate.alpha*data.interval/scalar;
    beta = data.rotationRate.beta*data.interval/scalar;
    gamma = data.rotationRate.gamma*data.interval/scalar;
  }
});
function aboveAbsThreshold(input, threshold) {
  return Math.abs(input) > threshold ? true : false;
}