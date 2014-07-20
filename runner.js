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

var numLEDs = 160;
var LEDs= new Array(numLEDs*3);
var id;


for(var i=0; i<numLEDs; i++){
 // LEDs[i]="0x060000";
//  LEDs[i]=parseInt(LEDs[i],16);
    LEDs[3*i]= 50;
    LEDs[3*i+1]= 0;
    LEDs[3*i+2]= 0;
}

socket.on('id', function(data){
  console.log(data);
  id = data;
});




serialPort.on("open", function () {
  console.log('open');
  /*
     serial port, maybe to full strip
     x : 0 to 160 \n

     socket
     x, rgb, type, id
     x : 0 to 1
     rgb : {r:val,g:val,b:val }
     type: 0 or 1
     id:
   */


  //serial port to socket

  serialPort.on('data', function(data) {

      console.log("back " + data);



//    position = data.replace(/(\r\n|\n|\r)/gm,"");
//    var val = position/numLEDs;
//    out = {x: val, rgb: {r:255, g:255, b:255}, id: id, type:1}
//    socket.emit('motion', out);
  });


  //socket to serial port
  /*
  socket.on('motion', function (p) {
    console.log("from web controls" + p);
    var str = p.x+','+p.r+','+p.g+','+p.b+','+p.type+';';
    serialPort.write(str, function(err, res){
      if (err) console.log('err '+err);
    });
  });
  */

  setInterval(function(){
    var str = LEDs.join(',') + '\n';
    serialPort.write(str, function(err, res){
      if (err) console.log('err '+err);
    });
    console.log('sent str ' + str);

    for(var i=0; i<numLEDs; i++){
//      LEDs[i]+=100;
    }
  },1000);

});

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    //arduino LED hex is grb
    return "0x" + componentToHex(g) + componentToHex(r) + componentToHex(b);
}

function hexToInt(str){
   return parseInt(str,16);
}
