
const path = require('path')
const express = require('express')
const ws = require('ws')
const webserver = express()
var expressWs = require('express-ws')(webserver);

webserver.use(express.static(path.join(__dirname, '..', 'web-ui')))
webserver.get("/", (req, res) => res.redirect('index.html'))

exports.run = function(signalKStream, devicesStream) {
    webserver.ws("/datastream", (ws, req) => {
        ws.send(JSON.stringify({ type: "hello" }))
        devicesStream
            .take(1)
            .onValue(v => ws.send(outgoingMessage("devices", devicesMessage(v))))
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
