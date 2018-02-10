
const Bacon = require("baconjs").Bacon

function makeRegistry(deviceStream, outputSelections) {
    const registryBus = new Bacon.Bus()
    const registry = registryBus.toProperty({})

    outputSelections
        .flatMap(selection =>
                 registry.take(1)
                 .map(reg => {
                     reg[selection.deviceId] = selection.selection;
                     return reg
                 }))
        .onValue(reg => registryBus.push(reg))  // TODO subscription

    return Bacon.combineTemplate({ devices: deviceStream, registry: registry })
        .map(({ devices, registry }) => devices.map(device => {
            const selectedPath = registry[device.id] || "navigation.speedOverGround"
            return {
                id: device.id,
                device: device,
                path: selectedPath
            }
        }))
}

module.exports = makeRegistry
