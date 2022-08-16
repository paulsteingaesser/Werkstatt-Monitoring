#include <Keypad.h>


//--- PinPad config ---
#define ROW_NUMBER 4
#define COLUM_NUMBER 3

char keys[ROW_NUMBER][COLUM_NUMBER] = {
  {'1', '2', '3'},
  {'4', '5', '6'},
  {'7', '8', '9'},
  {'r', '0', 'g'}
};

byte pin_rows[ROW_NUMBER] = {9, 8, 7, 6}; //connect to the row pinouts of the keypad
byte pin_column[COLUM_NUMBER] = {5, 4, 3}; //connect to the column pinouts of the keypad

Keypad keypad = Keypad( makeKeymap(keys), pin_rows, pin_column, ROW_NUMBER, COLUM_NUMBER );

const String password = "100"; // change your password here
String input_password;

void setup() {

  Serial.begin(115200);
  input_password.reserve(32); // maximum input characters is 33, change if needed

}

void loop() {
  char key = keypad.getKey();

  if (key){
    Serial.println(key);

    if(key == '*') {
      input_password = ""; // clear input password
    } else if(key == '#') {
      if(password == input_password) {
        Serial.println("password is correct");
        // DO YOUR WORK HERE
        
      } else {
        Serial.println("password is incorrect, try again");
      }

      input_password = ""; // clear input password
    } else {
      input_password += key; // append new character to input password string
    }
  }
}
