#include <FastLED.h>
#include <Keypad.h>

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
#define BLINK_NUMBER 10
long blinkcounter = BLINK_NUMBER;
bool ledsOn = true;
long blinkTimer = 0;
ledStates state;


//--- PinPad config ---
#define ROW_NUMBER 4
#define COLUM_NUMBER 3

char keys[ROW_NUMBER][COLUM_NUMBER] = {
  {'1', '2', '3'},
  {'4', '5', '6'},
  {'7', '8', '9'},
  {'r', '0', 'g'}
};

byte pin_rows[ROW_NUMBER] = {5, 17, 15, 2}; //connect to the row pinouts of the keypad
byte pin_column[COLUM_NUMBER] = {16, 4, 0}; //connect to the column pinouts of the keypad

Keypad keypad = Keypad( makeKeymap(keys), pin_rows, pin_column, ROW_NUMBER, COLUM_NUMBER );

const String password = "100"; // change your password here
String input_password;

void setup() {
  delay(1000); // 1 second delay for recovery
  
  FastLED.addLeds<LED_TYPE,DATA_PIN,COLOR_ORDER>(leds, NUM_LEDS).setCorrection(TypicalLEDStrip);

  // set master brightness control
  FastLED.setBrightness(BRIGHTNESS);

  Serial.begin(115200);

  input_password.reserve(32); // maximum input characters is 33, change if needed
  
  state = red;
  updateLEDs(red);
  //blinkTimer = millis();
  Serial.println("Hallo");
}

void loop() {

  checkPinPadInput();
  checkLEDblink();
}

void checkPinPadInput(){
  
  char key = keypad.getKey();

  if (key){
    Serial.println(key);

    if(key == 'r') {
      input_password = ""; // clear input password
      state = red;
      updateLEDs(red);
    } else if(key == 'g') {
      if(password == input_password) {
        Serial.println("password is correct");
        state = green;
        updateLEDs(green);
        
      } else {
        state = wrongLoginBlinkRed;
        blinkTimer = millis();
        Serial.println("password is incorrect, try again");
      }

      input_password = ""; // clear input password
    } else {
      input_password += key; // append new character to input password string
    }
  }
}

void checkLEDblink(){
  if(state == wrongLoginBlinkRed || state == systemErrorBlinkBlue){

    if(blinkcounter <= 0){
      state = red;
      updateLEDs(red);
      blinkTimer = 0;
      blinkcounter = BLINK_NUMBER;
    }
    if(millis() == blinkTimer + BLINK_INTERVALL){
      Serial.println("Change State");
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
