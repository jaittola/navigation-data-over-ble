#include <Adafruit_SPITFT.h>
#include <Adafruit_SPITFT_Macros.h>
#include <gfxfont.h>

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_FeatherOLED.h>

#include <bluefruit.h>

Adafruit_FeatherOLED oled = Adafruit_FeatherOLED();

BLEDis  bledis;
BLEUart bleuart;

int count = 0;

#define MAX_TITLE_LEN 3
#define MAX_VALUE_LEN 4
#define START_MARKER '%'
#define VALUE_MARKER ';'

void setup() {
  Serial.begin(115200);
  setupOled();
  drawStatusText("Connecting ...");
  setupBle();
}

void setupOled() {
  oled.init();
  oled.fillScreen(0);
  oled.setTextColor(WHITE, BLACK);
  oled.setTextWrap(false);
}

void setupBle() {
  Bluefruit.begin();
  Bluefruit.setName("OledDisplay");
  Bluefruit.setConnectCallback(bleConnectCallback);
  Bluefruit.setDisconnectCallback(bleDisconnectCallback);

  // Configure and Start Device Information Service
  bledis.setManufacturer("JA");
  bledis.setModel("Bluefruit Feather52 with OLED");
  bledis.begin();

  // Configure and Start BLE Uart Service
  bleuart.begin();

  // Set up Advertising Packet
  setupAdv();

  // Start Advertising
  Bluefruit.Advertising.start();
}

void setupAdv(void) {
  Bluefruit.Advertising.addFlags(BLE_GAP_ADV_FLAGS_LE_ONLY_GENERAL_DISC_MODE);
  Bluefruit.Advertising.addTxPower();

  // Include bleuart 128-bit uuid
  Bluefruit.Advertising.addService(bleuart);

  // There is no room for Name in Advertising packet
  // Use Scan response for Name
  Bluefruit.ScanResponse.addName();
}

void bleConnectCallback(unsigned short) {
  Serial.println("Connected");
  drawStatusText("Connected");
  bleuart.setRxCallback(bleDataReceived);
}

void bleDisconnectCallback(unsigned short, uint8_t reason) {
  Serial.print("Disconnected. Reason ");
  Serial.println(reason);
  drawStatusText("Connecting ...");
}

#define RECORD_LEN (MAX_TITLE_LEN + MAX_VALUE_LEN + 2)

void bleDataReceived() {
  int length = bleuart.available();

  Serial.print("Data available from bluetooth, byte count ");
  Serial.println(length);

  while (bleuart.available() > 0) {
    if (bleFindStartMarker()) {
      if (bleuart.available() >= RECORD_LEN) {
        uint8_t startmarker = bleuart.read();
        char title[MAX_TITLE_LEN + 1] = {'\0'};
        char value[MAX_VALUE_LEN + 1] = {'\0'};
        uint8_t valuemarker;
        bleuart.read(title, MAX_TITLE_LEN);
        valuemarker = bleuart.read();
        bleuart.read(value, MAX_VALUE_LEN);
        if (startmarker == START_MARKER && valuemarker == VALUE_MARKER) {
          drawData(title, value);
        }
      }
      else {
        bleuart.read();
      }
    }
  }
}

bool bleFindStartMarker() {
  if (bleuart.peek() == START_MARKER) {
    return true;
  }
  else {
    bleuart.read();
    return false;
  }
}

// Assume already-truncated and formatted value string
void drawData(const char *title, const char *value) {
  oled.fillScreen(0);
  oled.setTextSize(2);
  oled.setCursor(0, 0);
  oled.print(title);
  oled.setTextSize(4);
  oled.setCursor(36, 2);
  oled.print(value);
  oled.display();
}

void drawStatusText(const char *message) {
   oled.fillScreen(0);
   oled.setTextSize(0);
   oled.setCursor(0, 10);
   oled.print(message);
   oled.display();
}

void loop() {
  ++count;

  Serial.print("Much testing. Loop ");
  Serial.println(count);

  delay(1000);
}

