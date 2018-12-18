#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <EEPROM.h>
#include "FS.h"

// Data wire is plugged into port 2 on the Arduino
#define ONE_WIRE_BUS 5

// Setup a oneWire instance to communicate with any OneWire devices (not just Maxim/Dallas temperature ICs)
OneWire oneWire(ONE_WIRE_BUS);

// Pass our oneWire reference to Dallas Temperature. 
DallasTemperature sensors(&oneWire);

const char *ssid = "MeteoWiFi";
ESP8266WebServer server(80);

int address = 5;
byte value;
int8_t reader = 0;
int iteration = 0;
int uptime = 0; // system uptime in seconds

void refresh_img(){
  File file = SPIFFS.open("/refresh.png", "r");
  server.streamFile(file, "image/png");
  file.close();
}

void styles(){
  File file = SPIFFS.open("/styles.css", "r");
  server.streamFile(file, "text/css");
  file.close();
}

void scripts(){
  File file = SPIFFS.open("/scripts.js", "r");
  server.streamFile(file, "text/js");
  file.close();
}

void get_temp(){
  sensors.requestTemperatures();
  server.send(200, "text/plain", String(sensors.getTempCByIndex(0)));
}

void get_uptime(){
  server.send(200, "text/plain", String(uptime));
}

void data(){
  String res = "";
  int j = 0;
  for(int i = address; j < 24;){
    if(i >= 101) i = 1;
    reader = EEPROM.read(i + 1); // num partrea
    int decimal = EEPROM.read(i); // decimal part 
    i += 2;
    res += String(decimal / 100.0 + reader);
    res += ";";
    ++j;
  }
  server.send(200, "text/plain", String(res));
}

/*
Go to http://192.168.4.1
*/
void handleRoot() {
  Serial.print("Handling HTML request...");
  File file = SPIFFS.open("/index.html", "r");
  server.streamFile(file, "text/html");
  file.close();
  Serial.println("DONE");
}

void setup() {
  delay(1000);
  Serial.begin(115200);
  SPIFFS.begin();
  Serial.println();
  WiFi.softAP(ssid);
  IPAddress myIP = WiFi.softAPIP();
  Serial.print("AP IP: ");
  Serial.println(myIP);
  sensors.begin();
  EEPROM.begin(512);
  for(int i = 0; i <= 101; ++i)
    EEPROM.write(i, reader);
  save_temp();
  server.on("/", handleRoot);
  server.on("/styles.css", styles);
  server.on("/scripts.js", scripts);
  server.on("/refresh.png", refresh_img);
  server.on("/get_temp", get_temp);
  server.on("/data", data);
  server.on("/get_uptime", get_uptime);
  server.begin();
}

void loop(void)
{ 
  /**
   * Set AP handler
   * Trigger saving temp +- each minute
   */
  server.handleClient();
  delay(10);
  ++iteration;
  if(iteration == 5900){ // * 60 to make it one hour -- one minute is just for demo 
    save_temp();
    iteration = 0; 
  }
  if(iteration % 100 == 0) create_second();
}

void save_temp(){
  /**
   * Save temeprature to EEPROM into two bytes
   * first byte contains integer part, sedond byte contains decimal part
   */
  Serial.println("Interval temperature saving");
  if(address <= 1) address = 101;
  else --address;
  sensors.requestTemperatures();
  float temperature = sensors.getTempCByIndex(0);
  int first = (int)temperature;
  int second = (int)((temperature - first) * 100);
  int8_t val;
  if(first > 127) val = 127;
  else if(first < -127) val = -127;
  else val = first;
  EEPROM.write(address, val);
  EEPROM.write(--address, (int8_t)second);
}

void create_second(){
  ++uptime;
}
