var serialport = require("serialport"),
    socket = require('socket.io-client')('http://localhost:8000');


var SerialPort = serialport.SerialPort;
var serialPort = new SerialPort("/dev/tty.usbmodem1421", {
    baudrate: 115200,
    parser: serialport.parsers.readline("\n")
});

/*
   get the meterval of the LED strip

*/

var numLEDs = 160;
var LEDs= new Array(numLEDs);
var LEDs_stage= new Array(numLEDs);
var id;
var updated = true;

var runners = {};
var base_color ="0x000101";

for(var i=0; i<numLEDs; i++){
  LEDs[i]="0x000101";
}

LEDs_stage = LEDs;

socket.on('id', function(data){
  console.log(data);
  id = data;
  runners[id] = new Runner({r:255, g:255, b:0});
});

function Runner(rgb){
  this.x = 0;
  this.rgb  = rgb;
  this.r = this.rgb.r;
  this.g = this.rgb.g;
  this.b = this.rgb.b;
  this.hex = rgbToHex(this.rgb.r, this.rgb.g, this.rgb.b);
}

socket.on('motion', function(data){
  var d = data;
  if(!(d.id in runners)){
    runners[d.id] = new Runner(d.rgb);
    console.log("added cell " + d.id);
  }
  runners[d.id].x = data.x;
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

    position = data.replace(/(\r\n|\n|\r)/gm,"");
    var val = position/numLEDs;
    if(id in runners){
      runners[id].x = val;
      out = {x: val, rgb: runners[id].rgb, id: id, type:1}
      socket.emit('motion', out);
    }
  });



  setInterval(function(){

    rects = []
    for(var id in runners){
      rects.push({x:runners[id].x, hex:runners[id].hex})
    }

    rects.sort(function(a,b){return a.x - b.x});
   console.log(rects);

   var initial = 0;


   for(var i=0; i<rects.length-1; i++){
     if( rects[i].x == 0){
       initial++;
     } else{
      break;
     }
   }


   //first
    write([0,Math.floor(rects[initial].x*numLEDs), rects[initial].hex].join(',')+';');

   //middle
    for(var i=initial; i<rects.length-1; i++){
      var p1 = Math.floor(rects[i].x*numLEDs)
      var p2 = Math.floor(rects[i+1].x*numLEDs)
      write([p1,p2,rects[i+1].hex].join(',')+';');
    }

   //last
      var calm = "0x000001";
      write([Math.floor(rects[rects.length-1].x*numLEDs),numLEDs-1,calm].join(',')+';');

  },500);

});


function write(str){
  console.log(str);
  serialPort.write(str, function(err, res){
    if (err) console.log('err '+err);
  });
}



function updateLEDs(){
   if(!updated){
     LEDs = LEDs_stage.slice();
   }
   updated = true;
}

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
