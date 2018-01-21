
const express = require('express')
const webserver = express()

webserver.get("/", (req, res) => res.send("Hello, world!!1!"))

exports.run = () => webserver.listen(4000, () => console.log("Listening to HTTP port 4000"))
