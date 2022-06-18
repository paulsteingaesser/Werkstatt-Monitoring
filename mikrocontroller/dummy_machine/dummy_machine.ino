/*
 * Author: Jan Torge Schneider
 * 
 * Das Skript soll eine der Werkstattmaschinen simmulieren.
 * Dafür werden dummy Daten an den Server geschickt
 */

//--- Config ---
#define debugging true

#define wifinetwork "Bill Clinternet";
#define wifipassword "MartinRouterKing";

String machineName = "Testmaschine2";

const char* ssid = wifinetwork;
const char* password = wifipassword;

//Servername oder IP mit Pfad
String serverName = "http://192.168.10.82:1880/sendDummyData";

// the following variables are unsigned longs because the time, measured in
// milliseconds, will quickly become a bigger number than can be stored in an int.
unsigned long lastTime = 0;
// Timer set to 10 minutes (600000)
//unsigned long timerDelay = 600000;
// Set timer to 5 seconds (30000)
unsigned long timerDelay = 30000;

#include <Arduino_JSON.h>
#include <WiFi.h>
#include <HTTPClient.h>

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

 if ((millis() - lastTime) > timerDelay) {
    //Check WiFi connection status
    if(WiFi.status()== WL_CONNECTED){
      HTTPClient http;

      String serverPath = serverName + "?UserID=100&MaschinenName=" + machineName + "&Dauer=600000&Strom=100";
      
      // Your Domain name with URL path or IP address with path
      http.begin(serverPath.c_str());
      
      // Send HTTP GET request
      int httpResponseCode = http.GET();
      
      if (httpResponseCode>0) {
        if(debugging)
        {
          Serial.print("HTTP Response code: ");
          Serial.println(httpResponseCode);
        }
        
        String payload = http.getString();
        
        if(debugging)
        {
          Serial.println(payload);
        }
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
    }
    else {
      if(debugging)
      {
        Serial.println("WiFi Disconnected");
      }
    }
    lastTime = millis();
  }
}
