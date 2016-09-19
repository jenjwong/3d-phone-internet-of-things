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

var alpha = 0, beta = 0, gamma = 0;

// Fix OS paths
app.use(express.static(path.join(__dirname, 'public')));

session = require("express-session")({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true
  }),
  sharedsession = require("express-socket.io-session");

// Attach session
app.use(session);

// Share session with io sockets
io.use(sharedsession(session));

// Setup socket communication
io.on('connection', function ( socket ) {

   // Accept a login event with user's data
  socket.on("login", function(userdata) {
      socket.handshake.session.userdata = userdata;
  });
  socket.on("logout", function(userdata) {
      if (socket.handshake.session.userdata) {
          delete socket.handshake.session.userdata;
      }
  });        
  
  socket.on('joined', function() {
    console.log("Joined");
    socket.broadcast.emit('joined', {
      message: "Joined"
    });
  });
  
  // Data
  socket.on('phone-data', function ( data ) {    
    // Store acc data with lowpass filtering
    var smooth = 0.5;
    aX = smooth*data.accelerometer.x + (1-smooth)*aX;
    aY = smooth*data.accelerometer.y + (1-smooth)*aY;
    aZ = smooth*data.accelerometer.z + (1-smooth)*aZ;
    
    // Update vel, disp
    var steps = Math.round(1/data.interval);  
    displacement3D(data.interval, 1);
    
    // Broadcast new data
    socket.broadcast.emit('phone-data', {
      accelerometer: {
        x: aX,
        y: aY,
        z: aZ
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
  for (var i = 0; i < steps; i++) {
    vX = vX + dt*aX;
    vY = vY + dt*aY;
    vZ = vZ + dt*aZ;
    
    sX = sX + dt*vX;
    sY = sY + dt*vY;
    sZ = sZ + dt*vZ;
  }
}
