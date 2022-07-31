#include <FastLED.h>

//--- LED config ---
enum ledStates {
  off,
  red,
  green,
  yellow,
  blinkRed,
  errorBlinkOrange
};

#define DATA_PIN    3
#define LED_TYPE    WS2812B
#define COLOR_ORDER GRB
#define NUM_LEDS    10
#define BRIGHTNESS  60 //0-255
CRGB leds[NUM_LEDS];

#define BLINK_TIME 2000
bool ledsBlink = false;
bool ledsOn = true;
long blinkCounter = 0;
ledStates ledState;



void setup() {
  delay(1000); // 1 second delay for recovery
  
  FastLED.addLeds<LED_TYPE,DATA_PIN,COLOR_ORDER>(leds, NUM_LEDS).setCorrection(TypicalLEDStrip);

  // set master brightness control
  FastLED.setBrightness(BRIGHTNESS);

  ledState = red;
}

void loop() {
  if(ledsBlink){

    if(blinkCounter > BLINK_TIME){
      ledsBlink = false;
      ledState = red;
      updateLEDs(red);
    }
    if((blinkCounter % (BLINK_TIME / 5)) == 0){
      ledsOn != ledsOn;
      updateLEDs(ledState);
    }
    blinkCounter++;
  }
}

void updateLEDs(ledStates ledState){
  switch(ledState){
    case off:
      fill_solid(leds, NUM_LEDS, CRGB::Black);
      break;
    case red:
      fill_solid(leds, NUM_LEDS, CRGB::Red);
      break;
    case green:
      fill_solid(leds, NUM_LEDS, CRGB::Lime);
      break;
    case yellow:
      fill_solid(leds, NUM_LEDS, CRGB::Yellow);
      break;
    case blinkRed:
      if(ledsOn){
        fill_solid(leds, NUM_LEDS, CRGB::Red);
      }else{
        fill_solid(leds, NUM_LEDS, CRGB::Black);
      }
      break;
    case errorBlinkOrange:
      if(ledsOn){
        fill_solid(leds, NUM_LEDS, CRGB::Orange);
      }else{
        fill_solid(leds, NUM_LEDS, CRGB::Black);
      }
      break;
    default:
      fill_solid(leds, NUM_LEDS, CRGB::Red);
      break;   
  }
  FastLED.show();
}
