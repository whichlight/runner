var serialport = require("serialport"),
    socket = require('socket.io-client')('http://localhost:8000');


var SerialPort = serialport.SerialPort;
var serialPort = new SerialPort("/dev/tty.usbmodem1421", {
    baudrate: 9600,
    parser: serialport.parsers.readline("\n")
});

/*
   get the meterval of the LED strip

*/

serialPort.on("open", function () {
  console.log('open');
  /*
     INPUT: x,r,g,b;
     x : 0 to 160
     r : 0 to 255
     g : 0 to 255
     b : 0 to 255
     type : 0 to 1 , 1 is LEDs
   */
  serialPort.on('data', function(data) {
    position = data.replace(/(\r\n|\n|\r)/gm,"");
    out = {x: position, r:10, g:10, b:10, type:1}
    socket.emit('motion', out);
  });

  socket.on('motion', function (p) {
    console.log("from web controls" + p);
    var str = p.x+','+p.r+','+p.g+','+p.b+','+p.type+';';
    serialPort.write(str, function(err, res){
      if (err) console.log('err '+err);
    });
  });
});

