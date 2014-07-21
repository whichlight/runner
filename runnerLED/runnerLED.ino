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

char inData[80];
byte index = 0;
unsigned long time;


const int pwPin = 7;
Maxbotix rangeSensorPW(pwPin, Maxbotix::PW, Maxbotix::LV, Maxbotix::BEST, 3);
long pulse, inches, cm;


LPD8806 strip = LPD8806(total_leds, dataPin, clockPin);

void setup() {
  Serial.begin(115200);
  strip.begin();
  numPixels = strip.numPixels();

  //init
  for (int i=0; i < total_leds; i++) {
    strip.setPixelColor(i, 0x010101);
  }
  strip.show();

}


void loop() {

  time = millis();
  //read in array
  strip.show();

  while (Serial.available() > 0) {
    char aChar = Serial.read();
    if(aChar == ';')
    {
      // End of record detected. Time to parse
      long int col;
      char *p = inData; 
      char *str;
      int indexStart = atoi(strtok_r(p, ",", &p));
      int indexEnd = atoi(strtok_r(p, ",", &p));
      str = strtok_r(p, ",", &p);
      col = strtol(str, &str,16);
      for(int i=indexStart; i<indexEnd; i++){
        strip.setPixelColor(i,col);
      }
      index = 0;
      inData[index] = NULL;

      strip.show();
      if((millis() - time)>30){
        //pulse = rangeSensorPW.getRange();
        //meterVal = map(pulse, sonar_low, sonar_high, first_led, total_leds);
        Serial.print(10);
        Serial.println();  
        time = millis(); 
      } 


    }
    else
    {
      inData[index] = aChar;
      index++;
      inData[index] = '\0'; // Keep the string NULL terminated


    }




  }
}














