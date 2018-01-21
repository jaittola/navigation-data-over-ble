
const Bacon = require("baconjs").Bacon
const noble = require("noble")

const nordicUARTServiceUUID = "6e400001b5a3f393e0a9e50e24dcca9e"
const txUUID = "6e400002b5a3f393e0a9e50e24dcca9e"
const rxUUID = "6e400003b5a3f393e0a9e50e24dcca9e"

noble.on("stateChange", state => {
    if (state == "poweredOn") {
        console.log("BLE Powered on. Starting scanning.")
        noble.startScanning([nordicUARTServiceUUID], false)
    } else {
        console.log(`BLE State is ${state}. Stopping scanning.`)
        noble.stopScanning()
    }
})

noble.on("scanStart", () => console.log("BLE scan started"))
noble.on("scanStop", () => console.log("BLE scan stopped"))

// This stuff is bork. Need to get the connected state of the device
// somehow sorted; we must store the state with the device.
const connectedDevicesBus = new Bacon.Bus()
const connectedDevices = connectedDevicesBus
      .toProperty([])
      .map(devices => devices.filter(device => device.rx || device.tx))

connectedDevices
    .log("Connected devices: ")

const deviceDiscoveries = Bacon.fromEvent(noble, "discover")
      .doAction(peripheral => logPeripheral(peripheral))
      .doAction(peripheral => peripheral.connect())

const deviceConnectionsSubscription = deviceDiscoveries
      .flatMap(peripheral =>
               Bacon.fromEvent(peripheral, "connect").map(() => peripheral))
      .log()
      .doAction((peripheral) => { console.log("Device connects " + peripheral.id) })
      .flatMap(peripheral => Bacon.fromNodeCallback(doDiscovery, peripheral))
      .onValue(peripheral => addConnectedDevice(peripheral))

function createPeripheral(peripheral, rx, tx) {
    return {
        id: peripheral.id,
        peripheral: peripheral,
        rx: rx,
        tx: tx
    }
}

function doDiscovery(peripheral, callback) {
    const discoveryCallback = (error, services, characteristics) => {
        console.log("Discovery callback for " + peripheral.id)

        if (error) {
            console.log(`Discovery callback for ${peripheral.id} failed: ` + error)
            callback(error, createPeripherial(peripherial))
        } else {
            const receive = characteristics.filter(c => c.uuid == rxUUID)[0]
            const transmit = characteristics.filter(c => c.uuid = txUUID)[0]
            callback(error, createPeripheral(peripheral, receive, transmit))
        }
    }

    console.log("Discovering stuff for " + peripheral.id)
    peripheral.discoverSomeServicesAndCharacteristics([nordicUARTServiceUUID],
                                                      [rxUUID, txUUID],
                                                      discoveryCallback)
}

const deviceDisconnectsSubscription = deviceDiscoveries
      .flatMap(peripheral =>
               Bacon.fromEvent(peripheral, "disconnect").map(() => peripheral))
      .doAction((peripheral) => { console.log("Device disconnects " + peripheral.id) })
      .onValue(peripheral => removeConnectedDevice(peripheral))

function addConnectedDevice(peripheral) {
    connectedDevices
        .take(1)
        .map(peripherals => peripherals.filter(p => p.id != peripheral.id))
        .map(peripherals => { peripherals.push(peripheral); return peripherals })
        .onValue(peripherals => connectedDevicesBus.push(peripherals))
}

function removeConnectedDevice(peripheral) {
    connectedDevices
        .take(1)
        .map(peripherals => peripherals.filter(p => p.id != peripheral.id))
        .doAction(peripheral.connect())
        .onValue(peripherals => connectedDevicesBus.push(peripherals))
}

function logPeripheral(peripheral) {
    console.log('Discovered BLE device ' + peripheral.id +
                ' with local name ' + peripheral.advertisement.localName)
}

function writeToPeripheral(peripheral, message) {
    // You can only send at most 20 bytes in a Bluetooth LE packet. Here we assume that
    // message is < 20 bytes and ensure that by truncating it.
    const output = Buffer.from(message, 'ascii').slice(0, 19)
    console.log("Writing " + output.toString() + " to device " + peripheral.id)
    peripheral.tx.write(output)
}

exports.devices = connectedDevices
exports.writeToPeripheral = writeToPeripheral
