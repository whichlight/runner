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
var id;
var updated = true;

var runners = {};
var base_color ="0x000101";
var dist_floor = 0.4;



var sonar_data = new Sonar();

function Sonar(){
  this.buffer = [];
  this.size = 10;
}

Sonar.prototype.push= function(d){
  this.buffer.push(d);
  if(this.buffer.length>this.size){
    this.buffer.shift();
  }
}

Sonar.prototype.getVal = function(){
    var s = this.buffer.slice().sort();
    return s[Math.floor((s.length - 1) / 2)];
}

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
    val = 1-val;
    if(val<dist_floor){val=dist_floor;};
    val = map_range(val, dist_floor, 1, 0, 1);
    if(val<0){val=0};
    sonar_data.push(val);

    if(id in runners){
      var filtered = sonar_data.getVal();
      runners[id].x = filtered;
      out = {x: filtered, rgb: runners[id].rgb, id: id, type:1}
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

  },100);

});


function write(str){
  console.log(str);
  serialPort.write(str, function(err, res){
    if (err) console.log('err '+err);
  });
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

function map_range(value, low1, high1, low2, high2) {
      return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}
