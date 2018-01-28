
function makeRegistry(deviceStream) {
    return deviceStream.map(devices => devices.map(device => { return {
            id: device.id,
            device: device,
            path: "navigation.speedOverGround"
    }}))
}

module.exports = makeRegistry
