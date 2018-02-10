
const path = require('path')
const express = require('express')
const ws = require('ws')
const webserver = express()
const expressWs = require('express-ws')(webserver);
const Bacon = require("baconjs").Bacon

webserver.use(express.static(path.join(__dirname, '..', 'web-ui')))
webserver.get("/", (req, res) => res.redirect('index.html'))

const outputSelectionsBus = new Bacon.Bus()

function run(signalKStream, devicesStream) {
    webserver.ws("/datastream", (ws, req) => {
        ws.send(JSON.stringify({ type: "hello" }))
        devicesStream
            .take(1)
            .onValue(v => ws.send(outgoingMessage("devices", devicesMessage(v))))

        ws.on("message", msg => handleIncomingMessage(msg))
    })

    const signalKSubscription = signalKStream
          .onValue(v => broadcast("navdata", v))
    const devicesSubscription = devicesStream
          .onValue(v => broadcast("devices", devicesMessage(v)))

    webserver.listen(4000, () => console.log("Listening to HTTP port 4000"))

    return [ signalKSubscription, devicesSubscription ]
}


function broadcast(messageType, data) {
    expressWs.getWss().clients.forEach(client => {
        if (client.readyState === ws.OPEN) {
            client.send(outgoingMessage(messageType, data))
        }
    })
}

function devicesMessage(devices) {
    return devices.map(d => ({ id: d.id, path: d.path }))
}

function outgoingMessage(messageType, data) {
    return JSON.stringify({ type: messageType, value: data })
}

function handleIncomingMessage(messageText) {
    try {
        const msg = JSON.parse(messageText)
        console.log("Got incoming message " + messageText)
        switch (msg.type) {
        case "selectionOfOutput":
            outputSelectionsBus.push({ deviceId: msg.id, selection: msg.selection })
            break
        default:
        }
    } catch(exception) {
        console.log("Handling incoming message failed: " + exception + "; message was " + messageText)
    }
}

module.exports = {
    run: run,
    outputSelections: outputSelectionsBus
}
