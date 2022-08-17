#include <FastLED.h>

//--- LED config ---
enum ledStates {
  off,
  red,
  green,
  permissionNotHighEnoughMagenta,
  wrongLoginBlinkRed,
  systemErrorBlinkBlue
};

#define DATA_PIN    13
#define LED_TYPE    WS2812B
#define COLOR_ORDER GRB
#define NUM_LEDS    9
#define BRIGHTNESS  100 //0-255
CRGB leds[NUM_LEDS];

#define BLINK_INTERVALL 200
long blinkcounter = 10;
bool ledsOn = true;
long blinkTimer = 0;
ledStates state;



void setup() {
  delay(1000); // 1 second delay for recovery
  
  FastLED.addLeds<LED_TYPE,DATA_PIN,COLOR_ORDER>(leds, NUM_LEDS).setCorrection(TypicalLEDStrip);

  // set master brightness control
  FastLED.setBrightness(BRIGHTNESS);

  Serial.begin(115200);

  
  state = wrongLoginBlinkRed;
  blinkTimer = millis();
  //updateLEDs(blinkRed);
}

void loop() {
  if(state == wrongLoginBlinkRed || state == systemErrorBlinkBlue){

    if(blinkcounter <= 0){
      state = red;
      updateLEDs(red);
      blinkTimer = 0;
      blinkcounter = 5;
    }
    if(millis() == blinkTimer + BLINK_INTERVALL){
      ledsOn = !ledsOn;
      updateLEDs(state);
      blinkTimer = millis();
      blinkcounter--;
    }
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
      fill_solid(leds, NUM_LEDS, CRGB::Green);
      break;
    case permissionNotHighEnoughMagenta:
      //Magenta, Fuchsia, DeepPink, Crimson are also good warn colors
      fill_solid(leds, NUM_LEDS, CRGB::Magenta);
      break;
    case wrongLoginBlinkRed:
      if(ledsOn){
        fill_solid(leds, NUM_LEDS, CRGB::Red);
      }else{
        fill_solid(leds, NUM_LEDS, CRGB::Black);
      }
      break;
    case systemErrorBlinkBlue:
      if(ledsOn){
        fill_solid(leds, NUM_LEDS, CRGB::Blue);
      }else{
        fill_solid(leds, NUM_LEDS, CRGB::Black);
      }
      break;
    default:
      fill_solid(leds, NUM_LEDS, CRGB::Red);
      Serial.println("Default");
      break;   
  }
  FastLED.show();
}
