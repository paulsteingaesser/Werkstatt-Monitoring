/*
 * Author: Jan Torge Schneider
 * 
 */

//--- Config ---

//If debugging is true, the mikrocontroler must be connected to a pc. 
//There you can watch the live logs and outputs on a seriell monitor (for example in the Arduino IDE).
#define debugging true

#define wifinetwork "Bill Clinternet";
#define wifipassword "MartinRouterKing";

#define machinename "Testmaschine";

const char* ssid = wifinetwork;
const char* password = wifipassword;

//--- Initialisation ---
#include <Arduino_JSON.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <FastLED.h>


String jsonBuffer;

void setup() {

  if(debugging)
  {
    //Starts a serial connection to display infos on the arduino monitor.
    Serial.begin(115200);
    if(Serial)
    {
      ; //Wait till a serial Monitor is connected.
    }
  }

  WiFi.begin(ssid, password);
  if(debugging)
  {
    Serial.println("Connecting");
  }

  
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    if(debugging)
    {
      Serial.print(".");
    }
  }
  
  if(debugging)
  {
    Serial.println("");
    Serial.print("Connected to WiFi network with IP address: ");
    Serial.println(WiFi.localIP());
  }
}

void loop() {

//TODO -> Webserver der auf Port horcht? Oder Wie bekomme ich eine Antwort auf eine Anfrage

}

String httpGETRequest(const char* serverName) {
  WiFiClient client;
  HTTPClient http;
    
  //Domain name with URL path or IP address with path
  http.begin(client, serverName);
  
  // Send HTTP POST request, httpResponseCode gives additional infos about the connection state
  int httpResponseCode = http.GET();
  
  String payload = "{}";
  
  if (httpResponseCode>0) {
    
    if(debugging)
    {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
    }
    
    payload = http.getString();
  }
  else {
    if(debugging)
    {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }
  }
  
  // Free resources
  http.end();

  return payload;
}
