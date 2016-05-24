// Load dependencies
const express = require('express');
var app = express();  
const path = require('path'),
  server = require('http').createServer(app),
  port = process.env.PORT || 5223;
  io = require('socket.io')(server);

// Server global acc, vel, dist variables
var aX = 0, aY = 0, aZ = 0,
  vX = 0, vY = 0, vZ = 0,
  sX = 0, sY = 0, sZ = 0;

// Fix OS paths
app.use(express.static(path.join(__dirname, 'public')));

// Setup socket communication
io.on('connection', function ( socket ) {
  
  socket.on('joined', function() {
    console.log("Joined");
    socket.broadcast.emit('joined', {
      message: "Joined"
    });
  });
  
  // Data
  socket.on('phone-data', function ( data ) {
    // Check array size - same lengths
    // if (aX.length >= 100) chopArrays(100);
    
    // Store acc data
    aX = data.accelerometer.x;
    aY = data.accelerometer.y;
    aZ = data.accelerometer.z;
    
    // Update vel, disp
    var steps = Math.round(1/data.interval);  
    displacement3D(0.0167, 60);
    
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
      rotationRate: data.rotationRate,
      interval: data.interval
    });
  });
  
  socket.on('disconnect', function() {
    console.log("Client disconnected.");
    socket.broadcast.emit('disconnet', {});
  });
});
server.listen(port, function() {
  console.log('Server listening on port %d', port);
});

// Utils
function displacement3D(dt, steps) {
  for (var i = 1; i < steps; i++) {
    vX = vX + dt*aX;
    vY = vY + dt*aY;
    vZ = vZ + dt*aZ;
    
    sX = sX + dt*vX;
    sY = sY + dt*vY;
    sZ = sZ + dt*vZ;
  }
}