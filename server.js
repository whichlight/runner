var server = require('node-static');
var fileServer = new server.Server(__dirname);

var app = require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response);
    }).resume();
}).listen(8000);

var io = require('socket.io').listen(app);

io.sockets.on('connection', function (socket) {
  socket.on('meterVal', function (data) {
    socket.broadcast.emit("meterVal", data);
    console.log(data);
  });
});

