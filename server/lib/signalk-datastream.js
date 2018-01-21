
const WebSocket = require("ws")
const R = require("ramda")
const Bacon = require("baconjs").Bacon

exports.receiveMyData = uri => {
    console.log(`Starting to receive signalK data from ${uri}`)
    const ws = new WebSocket(uri)
    const deltaStream = Bacon.fromEvent(ws, 'message', event => event.data)
          .map(msg => JSON.parse(msg))

/*    const nameStreamSubscription = deltaStream
          .filter(msg => msg.hasOwnProperty("name"))
          .log("Got name stream message")
          .subscribe(nameMsg => processSignalKName(nameMsg))
*/
    return deltaStream
          .filter(msg => msg.hasOwnProperty("updates"))
          .flatMap(msg => Bacon.fromArray(R.pipe(R.prop('updates'),
                                                 R.pluck('values'),
                                                 R.flatten())(msg)))
}
