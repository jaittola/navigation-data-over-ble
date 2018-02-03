(function() {

    window.onload = function() {
        var navDataBody = document.getElementById("navigation-data-body")
        var devicesBody = document.getElementById("devices-body")

        var websocket = connectWebsocket()
        websocket.onmessage = function(event) {
            handleEventData(event.data, navDataBody, devicesBody)
        }
    }

    function connectWebsocket() {
        var protocolPrefix = (window.location.protocol === 'https:') ? 'wss:' : 'ws:'
        return new WebSocket(protocolPrefix + "//" + window.location.host + "/datastream")
    }

    function handleEventData(dataAsString, navDataBody, devicesBody) {
        try {
            var data = JSON.parse(dataAsString)
            switch (data.type) {
            case "navdata":
                handleNavdata(data.value, navDataBody)
                break
            case "devices":
                handleDevices(data.value, devicesBody)
                break
            default:
            }
        } catch (exception) {
            console.log("Handling websocket data failed: " + exception)
        }
    }

    function handleNavdata(navdata, tableBody) {
        if (navdata.path.match(/^(\w|\.)+$/)) {
            var rowId = "navdata-" + navdata.path
            var row = document.getElementById(rowId)
            if (row == null) {
                insertNavdataValue(tableBody, navdata, rowId)
            } else {
                var valueElement = row.getElementsByClassName("navdata-value")[0]
                if (valueElement != null)
                    setNavdataValue(valueElement, navdata.value)
            }
        }
    }

    function insertNavdataValue(tableBody, navdata, rowId) {
        var row = tableBody.insertRow(-1)
        row.id = rowId
        var pathElement = row.insertCell(0)
        pathElement.textContent = navdata.path
        var valueElement = row.insertCell(1)
        valueElement.classList.add("navdata-value")
        setNavdataValue(valueElement, navdata.value)
    }

    function setNavdataValue(valueElement, value) {
        if (value instanceof Object) {
            var result = Object.keys(value).sort()
                .map(function(key) { return key + ": " + value[key] })
                .join("; ")
            valueElement.textContent = result
        } else {
            valueElement.textContent = value
        }
    }

    function handleDevices(devicedata, tableBody) {

    }

})();
