
//Setup variables
int numberOfSamples = 4000;
double ICAL = 1;

//Set Voltage and current input pins
int inPinI1 = 35;

// CT: Voltage depends on current, burden resistor, and turns
#define CT_BURDEN_RESISTOR    22
#define CT_TURNS              2000
#define VOLTAGE               230

// Initial gueses for ratios, modified by VCAL/ICAL tweaks
double I_RATIO = (long double)CT_TURNS / CT_BURDEN_RESISTOR * 3.3 / 4096 * ICAL;

//Filter variables 1
double lastFilteredI, filteredI;
double sqI, sumI;
//Sample variables
int lastSampleI, sampleI;
double Irms1;
unsigned long timer;

void setup() {
  Serial.begin(115200);
  delay(500);
  pinMode(inPinI1, INPUT);
  adcAttachPin(inPinI1);
}

void loop() {
  timer = millis();
  //**************************************************************************
  //Phase1
  for (int n = 0; n < numberOfSamples; n++)
  {

    //Used for offset removal
    lastSampleI = sampleI;

    //Read in voltage and current samples.
    sampleI = analogRead(inPinI1);

    //Used for offset removal
    lastFilteredI = filteredI;

    //Digital high pass filters to remove 1.6V DC offset.
    filteredI = 0.9989 * (lastFilteredI + sampleI - lastSampleI);

    //Root-mean-square method current
    //1) square current values
    sqI = filteredI * filteredI;
    //2) sum
    sumI += sqI;
    delay(0.0002);
  }

  //Calculation of the root of the mean of the voltage and current squared (rms)
  //Calibration coeficients applied.
  Irms1 = (I_RATIO * sqrt(sumI / numberOfSamples)) - 1;
  if (Irms1 < 0) {
    Irms1 = 0;
  }; //Set negative Current to zero
  sumI = 0;

  Serial.println("Irms1: " + String(Irms1));
  Serial.println("Watt: " + String(Irms1 * VOLTAGE));
  delay(2000);
}
