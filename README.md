Receive yacht navigation data from a SignalK server and show it on Arduino devices connected with Bluetooth Low Energy (BLE)

* with a server implemented on node.js, get navigation data from a SignalK delta stream over a web socket and forward it to a connected BLE display device.

* On an Adafruit nRF52 module with an OLED display, receive data over BLE and display it.

* For now, use the Nordic UART profile for data delivery.

* On MacOS High Sierra, the released version of "noble" (1.8.1.) does not work. However, there's a working version of the library in Github.
   * To run this on Mac OS High Sierra, change the "noble" dependency in packages.json to
   "noble": "git://github.com/jacobrosenthal/noble.git#highsierra"
