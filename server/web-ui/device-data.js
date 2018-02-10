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
            setDataToTable("navdata-" + navdata.path, navdata.path, navdata.value, tableBody)
        }
    }


    function setDataToTable(rowId, title, value, tableBody) {
        var row = document.getElementById(rowId)
        if (row == null) {
            insertValueToTable(tableBody, title, value, rowId)
        } else {
            var valueElement = row.getElementsByClassName("navdata-value")[0]
            if (valueElement != null)
                updateValueElement(valueElement, value)
        }
    }

    function insertValueToTable(tableBody, title, value, rowId) {
        var row = tableBody.insertRow(-1)
        row.id = rowId
        var pathElement = row.insertCell(0)
        pathElement.classList.add("navdata-key")
        pathElement.textContent = title
        var valueElement = row.insertCell(1)
        valueElement.classList.add("navdata-value")
        updateValueElement(valueElement, value)
    }

    function updateValueElement(valueElement, value) {
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
        console.log("Got devices: " + JSON.stringify(devicedata))
        devicedata.forEach(function(device) {
            if (device.id.match(/^[0-9a-fA-F]+$/)) {
                setDataToTable("devicedata-" + device.id, device.id, device.path, tableBody)
            }
        })
    }
})();
