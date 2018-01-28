
/*
 * Please use 'npm start' to run this server.
 */

const Bacon = require("baconjs").Bacon
const webserver = require("./lib/webserver.js")
const signalKDatastream = require("./lib/signalk-datastream.js")
const formatting = require("./lib/display-output-formatting.js")
const bleDiscovery = require("./lib/ble-discovery.js")
const deviceRegistry = require("./lib/device-registry.js")

let uri = "ws://localhost:3000/signalk/v1/stream?subscribe=self"

if (process.argv.length > 2) {
    uri = process.argv[2]
}

const signalKDataStream = signalKDatastream.receiveMyData(uri)
const bleDevices = bleDiscovery.devices
const availableDevices = deviceRegistry(bleDevices)

Bacon.combineWith((value, devices) => [devices.filter(device => device.path === value.path),
                                       value],
                  signalKDataStream,
                  availableDevices)
    .flatMap(([devices, value]) => Bacon.fromArray(devices).map(device => [device, value] ))
    .map(([device, value]) => [device, formatting.format(value, device)])
    .onValue(([device, formattedValue]) => bleDiscovery.writeToDevice(device.device, formattedValue));

webserver.run()
