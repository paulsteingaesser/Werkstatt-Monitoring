/*
   Author: Jan Torge Schneider

   The script handles the machine modules.
   It registers logins and informs the server about these.
*/

//--- Includes (External Libraries) ---
#include <WiFi.h>
#include <HTTPClient.h>
#include <FastLED.h>
#include <Keypad.h>

//--- Config ---
// If you want to see outputs and logs, the mikrocontroller must be connected to a pc.
// There you can watch the live logs and outputs on a seriell monitor (for example in the Arduino IDE).
// Remove the two Slashes before #define to uncomment the line. The debugging is activated!
// If you dont haven an PC connected permanently to the mikrocontroller or dont need logs, just comment the following line code (with to Slahes //).
#define debugging

//-- Network config ---
#define wifinetwork "Bill Clinternet"
#define wifipassword "MartinRouterKing"

const char *ssid = wifinetwork;
const char *password = wifipassword;
String serverName = "http://192.168.10.82:1880/";

//--- User and Machine config ---
#define machineName "Testmaschine"
int userId;
int defaultId = 100;
bool isLoggedIn = false;
unsigned long timeOfLogin = 0;
unsigned long loginDuration = 0;

//--- LED config ---
enum ledStates
{
  off,
  red,
  green,
  permissionNotHighEnough_Magenta,
  systemError_Blue
};

#define DATA_PIN 13
#define LED_TYPE WS2812B
#define COLOR_ORDER GRB
#define NUM_LEDS 9
#define BRIGHTNESS 100 // 0-255
CRGB leds[NUM_LEDS];

#define BLINK_INTERVALL 250
#define BLINK_DURATION 3000
bool blink = false;
bool ledsOn = true;
unsigned long blinkStartMillis = 0;
unsigned long blinkPreviousMillis = 0;
ledStates ledState;

//--- PinPad config ---
#define ROW_NUMBER 4
#define COLUM_NUMBER 3

char keys[ROW_NUMBER][COLUM_NUMBER] = {
    {'1', '2', '3'},
    {'4', '5', '6'},
    {'7', '8', '9'},
    {'r', '0', 'g'}};

byte pin_rows[ROW_NUMBER] = {5, 17, 15, 2}; // connect to the row pinouts of the keypad
byte pin_column[COLUM_NUMBER] = {16, 4, 0}; // connect to the column pinouts of the keypad

Keypad keypad = Keypad(makeKeymap(keys), pin_rows, pin_column, ROW_NUMBER, COLUM_NUMBER);

const String test_id = "100"; // change your test id here
String inputID;

//--- Timer ---
// Wait this time in milliseconds until the script asks the server, if there is still an activ session for the machine
#define TIME_CHECK_IF_SESSION_ACTIVE 900000
unsigned long bufferTimeBetweenRequests = 0;

// Sets some initial values
void setup()
{

  #ifdef debugging
  // Starts a serial connection to display infos on the arduino monitor.
  Serial.begin(115200);
  if (Serial)
  {
    ; // Wait till a serial Monitor is connected.
  }
  #endif

  WiFi.begin(ssid, password);

  #ifdef debugging
  Serial.println("Connecting");
  #endif

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    #ifdef debugging
    Serial.print(".");
    #endif
  }

  #ifdef debugging
  Serial.println("");
  Serial.print("Connected to WiFi network with IP address: ");
  Serial.println(WiFi.localIP());
  #endif

  FastLED.addLeds<LED_TYPE, DATA_PIN, COLOR_ORDER>(leds, NUM_LEDS).setCorrection(TypicalLEDStrip);

  // set master brightness control
  FastLED.setBrightness(BRIGHTNESS);

  inputID.reserve(2); // maximum input characters is 3, change if needed

  ledState = red;
  updateLEDs(red);

  #ifdef debugging
  Serial.println("Hallo");
  #endif
}

void loop()
{

  checkPinPadInput();

  checkAutoLogoutTime();
}

void checkPinPadInput()
{

  char key = keypad.getKey();

  if (key)
  {
    Serial.println(key);

    if (key == 'r')
    {
      if (isLoggedIn)
      {
        logout();
      }
      inputID = ""; // clear input id
    }
    else if (key == 'g' && !isLoggedIn)
    {

      checkLogin();
    }
    else
    {
      if (!isLoggedIn)
      {
        inputID += key; // append new character to input password string
      }
    }
  }
}

void checkLogin()
{

  userId = inputID.toInt();
  // Send request to server and check if user exists and permission is high enough
  String serverPath = serverName + "checkIfUserExists" + "?userid=" + userId + "&machineName=" + machineName;

  String payload = httpGETRequest(serverPath);

  #ifdef debugging
  Serial.print("Payload from check login request: ");
  Serial.println(payload);
  #endif

  testID();

  evaluateCheckLoginPayload(payload);
}

void evaluateCheckLoginPayload(String payload)
{
  unsigned long currentMillis = millis();

  if(payload == "")
  {
    //if user exists and permission is correct, buffer user id -> LEDs green
    ledState = green;
    updateLEDs(ledState);
    isLoggedIn = true;
    timeOfLogin = currentMillis;
    bufferTimeBetweenRequests = currentMillis;
  }
  else if(payload == "")
  {
    //if user exists and permission is not high enough, buffer user id -> LEDs blink magenta
    ledState = permissionNotHighEnough_Magenta;
    updateLEDs(ledState);
    isLoggedIn = true;
    timeOfLogin = currentMillis;
    bufferTimeBetweenRequests = currentMillis;
  }
  else if(payload == "")
  {
    //if user does not exists -> LEDs blink short time red, than back to constant red
    ledState = red;
    blink = true;
    blinkStartMillis = currentMillis;
    userId = 0;
    inputID = "";
  }
  else{

    //Error occured
    ledState = systemError_Blue;
    blink = true;
    blinkStartMillis = currentMillis;
    userId = 0;
    inputID = "";
  }
}

void testID()
{

  if (test_id == inputID)
  {
    ledState = green;
    updateLEDs(green);
    isLoggedIn = true;
    timeOfLogin = millis();

    #ifdef debugging
    Serial.println("ID is correct");
    #endif
  }
  else
  {
    ledState = red;
    blink = true;
    blinkStartMillis = millis();

    #ifdef debugging
    Serial.println("ID is incorrect, try again");
    #endif
  }

  inputID = ""; // clear input password
}

void logout()
{
  loginDuration = millis() - timeOfLogin;

  sendDataToServer();

  reset();
}

void reset()
{
  loginDuration = 0;
  timeOfLogin = 0;
  bufferTimeBetweenRequests = 0;
  userId = 0;

  isLoggedIn = false;
}

void sendDataToServer()
{
  //TODO vielleicht zwischen logoutFromMachine und autoLogoutFromMachine unterscheiden?
  String serverPath = serverName + "logoutFromMachine" + "?userid=" + userId + "&machineName=" + machineName + "&loginDuration=" + loginDuration;

  String payload = httpGETRequest(serverPath);

  #ifdef debugging
  Serial.print("Payload: ");
  Serial.println(payload);
  #endif

  //TODO Better error handling
  if (payload != "200")
  {
    ledState = systemError_Blue;
    blink = true;
    blinkStartMillis = millis();
  }
}

void checkAutoLogoutTime()
{
  if (isLoggedIn && (millis() > bufferTimeBetweenRequests + TIME_CHECK_IF_SESSION_ACTIVE))
  {
    // TODO Serial Print einbauen
    checkActiveSession();
  }
}

void checkActiveSession()
{
  // Send request to server and check whether the machine has still an active session
  String serverPath = serverName + "checkForActiveSession" + "?machineName=" + machineName;

  String payload = httpGETRequest(serverPath);

  #ifdef debugging
  Serial.print("Payload from active session request: ");
  Serial.println(payload);
  #endif

  evaluateActiveSessionPayload(payload);
}

void evaluateActiveSessionPayload(String payload)
{

  if (payload == "nothing messured yet")
  {
    // Reset buffer to now
    bufferTimeBetweenRequests = millis();
  }
  else if (payload == "something messured and timer is still active")
  {
    // TODO if the top two cases are the same, combine them
    bufferTimeBetweenRequests = millis();
  }
  else if (payload == "something messured but timer is due")
  {
    // Auto logout
    logout();
  }
}

String httpGETRequest(String serverName)
{

  WiFiClient client;
  HTTPClient http;
  String payload = "{}";

  if (WiFi.status() == WL_CONNECTED)
  {
    // Domain name with URL path or IP address with path
    http.begin(client, serverName.c_str());

    // Send HTTP POST request, httpResponseCode gives additional infos about the connection state
    int httpResponseCode = http.GET();

    if (httpResponseCode > 0)
    {

      #ifdef debugging
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      #endif

      payload = http.getString();
    }
    else
    {
      #ifdef debugging
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
      #endif
    }

    // Free resources
    http.end();
  }
  else
  {
    #ifdef debugging
    Serial.println("WiFi Disconnected");
    #endif
  }

  return payload;
}

void checkLEDblink()
{
  if (blink)
  {
    unsigned long currentMillis = millis();

    if (currentMillis - blinkStartMillis >= BLINK_DURATION)
    {
      blink = false;
      ledState = red;
      updateLEDs(ledState);

    }else if (currentMillis - blinkPreviousMillis >= BLINK_INTERVALL)
    {
      blinkPreviousMillis = currentMillis;

      if(ledsOn)
      {
        // Switch leds of
        updateLEDs(off);

      }else
      {
        updateLEDs(ledState);
      }

      // Toggle ledsOn
      ledsOn != ledsOn;
    }
  }
}

void updateLEDs(ledStates ledState)
{
  switch (ledState)
  {
    case off:
      fill_solid(leds, NUM_LEDS, CRGB::Black);
      break;
    case red:
      fill_solid(leds, NUM_LEDS, CRGB::Red);
      break;
    case green:
      fill_solid(leds, NUM_LEDS, CRGB::Green);
      break;
    case permissionNotHighEnough_Magenta:
      // Magenta, Fuchsia, DeepPink, Crimson are also good warn colors
      fill_solid(leds, NUM_LEDS, CRGB::Magenta);
      break;
    case systemError_Blue:
        fill_solid(leds, NUM_LEDS, CRGB::Blue);
      break;
    default:
      fill_solid(leds, NUM_LEDS, CRGB::Red);
      Serial.println("Default");
      break;
  }
  FastLED.show();
}
