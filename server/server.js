
/*
 * Please use 'npm start' to run this server.
 */

const Bacon = require("baconjs").Bacon
const webserver = require("./lib/webserver.js")
const signalKDatastream = require("./lib/signalk-datastream.js")
const formatting = require("./lib/display-output-formatting.js")
const bleDiscovery = require("./lib/ble-discovery.js")

let uri = "ws://localhost:3000/signalk/v1/stream?subscribe=self"

if (process.argv.length > 2) {
    uri = process.argv[2]
}

webserver.run()

const signalKSog = signalKDatastream.receiveMyData(uri)
      .filter(signalKValue => signalKValue.path == "navigation.speedOverGround")
      .map(signalKValue => formatting.format(signalKValue, null))

const devices = bleDiscovery.devices

Bacon.combineWith((devices, sog) => { return { devices: devices, sog: sog } },
                  devices,
                  signalKSog)
    .filter(v => v.devices.length > 0)
    .onValue(v => {
        v.devices.forEach(device => bleDiscovery.writeToPeripheral(device, v.sog))
    })
