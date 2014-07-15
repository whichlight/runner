#include "LPD8806.h"
#include "SPI.h"
#include "Maxbotix.h"


/*****************************************************************************/

int dataPin = 8;
int clockPin = 9;


int meterVal = 0;
int litLEDs = 0;
int maxVal = 30;
// colors : 16000=bright red, 1=darkblue,
int sonar_high = 300; //ad this val all will be lit
int sonar_low = 10;
int first_led = 0;
int colorThresh = 150;
const int total_leds = 160;

const int  pastCheckNum=5;
int pastVals[pastCheckNum];


const int pwPin = 7;
Maxbotix rangeSensorPW(pwPin, Maxbotix::PW, Maxbotix::LV, Maxbotix::BEST, 3);
long pulse, inches, cm;


LPD8806 strip = LPD8806(total_leds, dataPin, clockPin);

void setup() {
  Serial.begin(9600);
  strip.begin();

  for(int i=0; i<pastCheckNum; i++){
    pastVals[i]=0; 
  }
}


void loop() {


  for(int i=0; i<pastCheckNum; i++){
    pastVals[i]=pastVals[i+1]; 
  }
  pastVals[pastCheckNum-1]=litLEDs; 


  int numPixels;
  pulse = rangeSensorPW.getRange();
  meterVal = map(pulse, sonar_low, sonar_high, first_led, total_leds);

  Serial.print(meterVal);
  Serial.println();




  litLEDs= meterVal;
  if (litLEDs > colorThresh){
   litLEDs = 0; 
  }

  int overlap=0;

  numPixels = strip.numPixels();
  for (int i=0; i <= numPixels; i++) {
    overlap=0;
    strip.setPixelColor(i, 0);
    /*
    for(int j=0; j<pastCheckNum; j++){
      if(i <=  pastVals[j]){
        overlap++;
        //strip.setPixelColor(i, j*2,0,j);
      }
    }
    */

    if(i <=  litLEDs){
      overlap++;
          strip.setPixelColor(i, 10, 10, 10);

    }
  }
  strip.show();
}





