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
int numPixels;
int h=0x0;

int ledIndex = 0;


const int pwPin = 7;
Maxbotix rangeSensorPW(pwPin, Maxbotix::PW, Maxbotix::LV, Maxbotix::BEST, 3);
long pulse, inches, cm;


LPD8806 strip = LPD8806(total_leds, dataPin, clockPin);

void setup() {
  Serial.begin(9600);
  strip.begin();
  numPixels = strip.numPixels();
  
  //init
  for (int i=0; i < total_leds; i++) {
    strip.setPixelColor(i, 0x010101);
  }
  strip.show();

}


void loop() {

  pulse = rangeSensorPW.getRange();
  meterVal = map(pulse, sonar_low, sonar_high, first_led, total_leds);

  //Serial.print(meterVal);
  //Serial.println();

  litLEDs= meterVal;
  if (litLEDs > colorThresh){
    litLEDs = 0; 
  }
  
  //read in array
  

  
  while (Serial.available() > 0) {
    int r = Serial.parseInt();
    int g = Serial.parseInt();
    int b = Serial.parseInt();
    strip.setPixelColor(ledIndex,r,g,b);
    ledIndex++;
    if (ledIndex == 160) {
      ledIndex=0; 
      strip.show();
    }
  }
  
}






