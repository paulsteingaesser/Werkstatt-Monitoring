/*
   Author: Jan Torge Schneider

   The script messures the current on different input pins.
   The data will be send to a server.
*/

//--- Includes (External Libraries) ---
#include <WiFi.h>
#include <HTTPClient.h>


//--- Config ---
//Define how many phases are messured. (How many sensors are connected)
//If you dont use three connectors comment out the inputPins you dont use. Like: "//#define inPinI3 34;" if you dont user Pin 34.
#define inPinI1 39
//#define inPinI2 35
//#define inPinI3 34

//If you want to see outputs and logs, the mikrocontroller must be connected to a pc.
//There you can watch the live logs and outputs on a seriell monitor (for example in the Arduino IDE).
//Remove the two Slashes before #define to uncomment the line. The debugging is activated!
//If you dont haven an PC connected permanently to the mikrocontroller or dont need logs, just comment the following line code (with to Slahes //).
#define debugging;


//-- Network config ---
#define wifinetwork "Bill Clinternet"
#define wifipassword "MartinRouterKing"

const char* ssid = wifinetwork;
const char* password = wifipassword;
String serverName = "http://192.168.10.82:1880/";

//--- User and Machine config ---
#define machineOnPin1 "Testmaschine"
long duration = 0;


//--- Powermessuring config ---
int numberOfSamples = 4000;
double ICAL = 1;

//CT: Voltage depends on current, burden resistor, and turns
#define CT_BURDEN_RESISTOR    22
#define CT_TURNS              2000
#define VOLTAGE               230

//Initial gueses for ratios, modified by VCAL/ICAL tweaks
double I_RATIO = (long double)CT_TURNS / CT_BURDEN_RESISTOR * 3.3 / 4096 * ICAL;

//Filter variables
double lastFiltered, filtered = 0;
double rms, sum;
//Sample variables
int lastSample, sample = 0;
double Irms1 = 0;
double Irms2 = 0;
double Irms3 = 0;

double offsetCurrent = 0.5;
bool startedPowerConsumption = false;

//--- Timer ---
long timeOfFirstMessurement = 0;
long timeOfLastMessurement = 0;


void setup() {

  #ifdef inPinI1
    pinMode(inPinI1, INPUT);
    adcAttachPin(inPinI1);
  #endif
  #ifdef inPinI2
    pinMode(inPinI2, INPUT);
    adcAttachPin(inPinI2);
  #endif
  #ifdef inPinI3
    pinMode(inPinI3, INPUT);
    adcAttachPin(inPinI3);
  #endif

  #ifdef debugging
    //Starts a serial connection to display infos on the arduino monitor.
    Serial.begin(115200);
    if (Serial)
    {
      ; //Wait till a serial Monitor is connected.
    }
  #endif

  WiFi.begin(ssid, password);

  #ifdef debugging
    Serial.println("Connecting");
  #endif


  while (WiFi.status() != WL_CONNECTED) {
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
  
  #ifdef debugging
    Serial.println("Hallo");
  #endif
}

void loop() {

  checkCurrent();
}

void checkCurrent() {

  bool newInputCurrent = false;

  #ifdef inPinI1
    double messuredCurrent1 = messureCurrent(inPinI1);
    
    #ifdef debugging
      Serial.println("Irms1: " + String(messuredCurrent1));
      Serial.println("Watt1: " + String(messuredCurrent1 * VOLTAGE));
    #endif
    
    if (messuredCurrent1 > offsetCurrent) {
      calcualteAverageCurrent(messuredCurrent1, &Irms1);
      newInputCurrent = true;
    }
  #endif
  
  #ifdef inPinI2
    double messuredCurrent2 = messureCurrent(inPinI2);
    
    #ifdef debugging
      Serial.println("Irms2: " + String(messuredCurrent2));
      Serial.println("Watt2: " + String(messuredCurrent2 * VOLTAGE));
    #endif

    if (messuredCurrent2 > offsetCurrent) {
      calcualteAverageCurrent(messuredCurrent2, &Irms2);
      newInputCurrent = true;
    }
  #endif
  
  #ifdef inPinI3
    double messuredCurrent3 = messureCurrent(inPinI3);
    
    #ifdef debugging
      Serial.println("Irms3: " + String(messuredCurrent3));
      Serial.println("Watt3: " + String(messuredCurrent3 * VOLTAGE));
    #endif

    if (messuredCurrent3 > offsetCurrent) {
      calcualteAverageCurrent(messuredCurrent3, &Irms3);
      newInputCurrent = true;
    }
  #endif

  checkPowerConsumptionState(newInputCurrent);
  
  //Blinkt, wenn niemand eingeloggt ist, aber Strom verbraucht wird.
  if(!isLoggedIn && newInputCurrent && state != wrongLoginBlinkRed){
    state = wrongLoginBlinkRed;
    blinkTimer = millis();
  }
}

double messureCurrent(int inputPin) {

  for (int n = 0; n < numberOfSamples; n++){

    //Used for offset removal
    lastSample = sample;

    //Read in voltage and current samples.
    sample = analogRead(inputPin);

    //Used for offset removal
    lastFiltered = filtered;

    //Digital high pass filters to remove 1.6V DC offset.
    filtered = 0.9989 * (lastFiltered + sample - lastSample);

    //Root-mean-square method current
    //1) square current values
    rms = filtered * filtered;
    //2) sum
    sum += rms;
    delay(0.0002);
  }

  //Calculation of the root of the mean of the voltage and current squared (rms)
  //Calibration coeficients applied.
  double calculatedCurrent = (I_RATIO * sqrt(sum / numberOfSamples)) - 1;
  if (calculatedCurrent < 0) {
    //Set negative Current to zero
    calculatedCurrent = 0;
  };
  sum = 0;
  sample = 0;
  filtered = 0;

  return calculatedCurrent;
}

void calcualteAverageCurrent(double messuredCurrent, double *mainCurrent) {

  if (*mainCurrent == 0) {

    *mainCurrent = messuredCurrent;
  }
  else {
    //calculate the average current
    *mainCurrent = (*mainCurrent + messuredCurrent) / 2;
  }
}

void checkPowerConsumptionState(bool newCurrent){
  
  //Check if there is new Input and there was no power consumption before
  if (newCurrent && !startedPowerConsumption) {

    //If this is the first messurement, end the setupTime
    if(!checkIfThereWasPowerConsumption()){
      setupTime = millis() - setupTime;
    }
    startedPowerConsumption = true;
    timeOfFirstMessurement = millis();
    timeOfLastMessurement = 0;
  }

  //Check if there is no Input but there was no power consumption before
  if(!newCurrent && startedPowerConsumption){
    
    startedPowerConsumption = false;
    duration = duration + millis() - timeOfFirstMessurement;
    timeOfFirstMessurement = 0;
    timeOfLastMessurement = millis();
  }
}

void sendDataAutomatically() {

  //Save duration if its still running
  if(timeOfFirstMessurement != 0){
    duration = duration + millis() - timeOfFirstMessurement;
  }
    
  collectDataAndCreateString(calculatePower());

  reset();
}

double calculatePower() {

  return VOLTAGE * (Irms1 + Irms2 + Irms3);
}

void collectDataAndCreateString(double power) {
  
  String serverPath;
  if(isLoggedIn){
    serverPath = serverName + "sendData" + "?userid=" + userId + "&machineName=" + machineName + "&setupTime=" + setupTime + "&duration=" + duration + "&power=" + String(power);
  }else{
    serverPath = serverName + "sendData" + "?userid=" + defaultId + "&machineName=" + machineName + "&setupTime=" + setupTime + "&duration=" + duration + "&power=" + String(power);
  }

  String payload = httpGETRequest(serverPath);

  #ifdef debugging
    Serial.print("Payload: ");
    Serial.println(payload);
  #endif

  if(payload != "200"){
    state = systemErrorBlinkBlue;
    blinkTimer = millis();
  }
}

String httpGETRequest(String serverName) {
  
  WiFiClient client;
  HTTPClient http;
  String payload = "{}";

  if (WiFi.status() == WL_CONNECTED) {
    //Domain name with URL path or IP address with path
    http.begin(client, serverName.c_str());

    // Send HTTP POST request, httpResponseCode gives additional infos about the connection state
    int httpResponseCode = http.GET();

    if (httpResponseCode > 0) {

      #ifdef debugging
        Serial.print("HTTP Response code: ");
        Serial.println(httpResponseCode);
      #endif

      payload = http.getString();
    }
    else {
      #ifdef debugging
        Serial.print("Error code: ");
        Serial.println(httpResponseCode);
      #endif
    }

    // Free resources
    http.end();
  }
  else {
    #ifdef debugging
      Serial.println("WiFi Disconnected");
    #endif
  }

  return payload;
}
