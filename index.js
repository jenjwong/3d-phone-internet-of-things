// Load dependencies
const express = require('express');
var app = express();  
const path = require('path'),
  server = require('http').createServer(app),
  port = process.env.PORT || 8080;
  io = require('socket.io')(server);

// Server global acc, vel, dist variables
// var aX = [0], aY = [0], aZ = [0],
//   vX = [0], vY = [0], vZ = [0],
//   sX = [0], sY = [0], sZ = [0];
var aX = 0, aY = 0, aZ = 0,
  vX = 0, vY = 0, vZ = 0,
  sX = 0, sY = 0, sZ = 0;

// Fix OS paths
app.use(express.static(path.join(__dirname, 'public')));

// Setup socket communication
io.on('connection', function ( socket ) {
  
  // Data
  socket.on('phone-data', function ( data ) {
    // Check array size - same lengths
    // if (aX.length >= 100) chopArrays(100);
    
    // Store acc data
    // aX.push(data.accelerometer.x);
    // aY.push(data.accelerometer.y);
    // aZ.push(data.accelerometer.z);
    aX = data.accelerometer.x;
    aY = data.accelerometer.y;
    aZ = data.accelerometer.z;
    
    // Update vel, disp
    let steps = Math.round(1/data.interval);
    displacement3D(data.interval, steps);
    
    // Broadcast new data
    socket.broadcast.emit('phone-data', {
      accelerometer: {
        x: data.accelerometer.x,
        y: data.accelerometer.y,
        z: data.accelerometer.z
      },
      velocity: {
        vX: vX,
        vY: vY,
        vZ: vZ
      },
      displacement: {
        sX: sX,
        sY: sY,
        sZ: sZ
      },
      interval: data.interval
    });
  });
  
});
server.listen(port, function() {
  console.log('Server listening on port %d', port);
});

// Utils
function displacement3D(dt, steps) {
  for (var i = 1; i < steps; i++) {
    vX += vX + dt*aX;
    vY += vY + dt*aY;
    vZ += vZ + dt*aZ;
    
    sX += sX + dt*vX;
    sY += sY + dt*vY;
    sZ += sZ + dt*vZ;
  }
}
// function displacement3D(dt, steps) {
//   for (var i = 1; i < steps + 1; i++) {
//     // Update velocities
//     vX.push( vX[i-1] +  dt*aX[i-1] );
//     vY.push( vY[i-1] +  dt*aY[i-1] );
//     vZ.push( vZ[i-1] +  dt*aZ[i-1] );
//     
//     // Update displacements
//     sX.push( sX[i-1] + dt*vX[i-1] );
//     sY.push( sY[i-1] + dt*vY[i-1] );
//     sZ.push( sZ[i-1] + dt*vZ[i-1] );
//     
//     console.log(vX.length);
//   }
// }
// Hack to keep performance on server
function chopArrays(limit) {
  aX = aX.slice(limit, aX.length);
  aY = aY.slice(limit, aY.length);
  aZ = aZ.slice(limit, aZ.length);
  vX = vX.slice(limit, vX.length);
  vY = vY.slice(limit, vY.length);
  vZ = vZ.slice(limit, vZ.length);
  sX = sX.slice(limit, sX.length);
  sY = sY.slice(limit, sY.length);
  sZ = sZ.slice(limit, sZ.length);
}
