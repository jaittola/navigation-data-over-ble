(function() {

    window.onload = function() {
        var navDataBody = document.getElementById("navigation-data-body")
        var devicesBody = document.getElementById("devices-body")

        var dataKeys = new Set([])
        var addDataKey = makeAddDataKeyFunction(dataKeys, devicesBody)

        var websocket = connectWebsocket()
        websocket.onmessage = function(event) {
            handleEventData(event.data, navDataBody, devicesBody, addDataKey,
                            Array.from(dataKeys.values()).sort(),
                           websocket)
        }
    }

    function connectWebsocket() {
        var protocolPrefix = (window.location.protocol === 'https:') ? 'wss:' : 'ws:'
        return new WebSocket(protocolPrefix + "//" + window.location.host + "/datastream")
    }

    function handleEventData(dataAsString, navDataBody, devicesBody, addDataKey, dataKeys, websocket) {
        try {
            var data = JSON.parse(dataAsString)
            switch (data.type) {
            case "navdata":
                handleNavdata(data.value, navDataBody, addDataKey)
                break
            case "devices":
                handleDevices(data.value, devicesBody, dataKeys, websocket)
                break
            default:
            }
        } catch (exception) {
            console.log("Handling websocket data failed: " + exception)
        }
    }

    function handleNavdata(navdata, tableBody, addDataKey) {
        if (navdata.path.match(/^(\w|\.)+$/)) {
            setDataToTable("navdata-" + navdata.path, navdata.path,
                           navdata.value, tableBody, updateValueElement)
            addDataKey(navdata.path)
        }
    }

    function setDataToTable(rowId, title, value, tableBody, setValueElementData) {
        var row = document.getElementById(rowId)
        if (row == null) {
            insertValueToTable(tableBody, title, value, rowId, setValueElementData)
        } else {
            var valueElement = row.getElementsByClassName("navdata-value")[0]
            if (valueElement != null)
                setValueElementData(valueElement, value)
        }
    }

    function insertValueToTable(tableBody, title, value, rowId,
                                setValueElementData) {
        var row = tableBody.insertRow(-1)
        row.id = rowId
        var pathElement = row.insertCell(0)
        pathElement.classList.add("navdata-key")
        pathElement.textContent = title
        var valueElement = row.insertCell(1)
        valueElement.classList.add("navdata-value")
        setValueElementData(valueElement, value)
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

    function updateDeviceDataDropdown(dataKeys, device, websocket) {
        return function(valueElement, value) {
            valueElement.innerHTML = ""
            var select = document.createElement("select")
            select.classList.add("data-type-selection")
            setValuesInDropdown(select, dataKeys, value)
            valueElement.appendChild(select)
            select.onchange = function(event) {
                sendSelectionToServer(websocket, device.id, event.target.value)
            }
        }
    }

    function handleDevices(devicedata, tableBody, dataKeys, websocket) {
        devicedata.forEach(function(device) {
            if (device.id.match(/^[0-9a-fA-F]+$/)) {
                setDataToTable("devicedata-" + device.id, device.id,
                               device.path, tableBody,
                               updateDeviceDataDropdown(dataKeys, device, websocket))
            }
        })
    }

    function makeAddDataKeyFunction(dataKeys, deviceListTable) {
        return function(dataKey) {
            if (!dataKeys.has(dataKey)) {
                dataKeys.add(dataKey)
                updateDataValueDropdowns(dataKey, Array.from(dataKeys.values()).sort(), deviceListTable)
            }
        }
    }

    function updateDataValueDropdowns(newDataKey, allDataKeys, deviceListTable) {
        Array.from(deviceListTable.getElementsByClassName("data-type-selection")).forEach(function(dropdown) {
            var currentValue = dropdown.value
            dropdown.innerHTML = ""
            setValuesInDropdown(dropdown, allDataKeys, currentValue)
        })
    }

    function setValuesInDropdown(dropdown, values, value) {
        values.forEach(function(key) { addToDropdown(dropdown, key) })
        var indexOfSelected = values.indexOf(value)
        if (indexOfSelected >= 0) {
            dropdown.selectedIndex = indexOfSelected
        } else {
            addToDropdown(dropdown, value)
            dropdown.selectedIndex = values.length
        }
    }

    function addToDropdown(dropdown, value) {
        var option = document.createElement("option")
        option.text = value
        option.value = value
        dropdown.add(option)
    }

    function sendSelectionToServer(websocket, deviceId, selection) {
        websocket.send(JSON.stringify({ type: "selectionOfOutput",
                                        id: deviceId,
                                        selection: selection }))
    }
})();
