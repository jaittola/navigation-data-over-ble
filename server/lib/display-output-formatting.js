
exports.format = (signalKValue, device) => {
    const valueName = signalKValue.path.replace(/\./g, "_")
    if (formatters.hasOwnProperty(valueName))
        return formatTitlePairForOutput(formatters[valueName](signalKValue.value))
    else
        return null
}

const M_PER_SEC_TO_KNOTS = 1.94384

const formatters = {
    navigation_speedOverGround: function(speed) {
        return { title: "SOG", value: to3Digits((speed * M_PER_SEC_TO_KNOTS)) }
    },

    navigation_courseOverGroundTrue: function(course) {
        return { title: "COG", value: leftpad(course.toFixed(0)) }
    },

    navigation_speedThroughWater: function(speed) {
        return { title: "SPD", value: to3Digits((speed * M_PER_SEC_TO_KNOTS)) }
    },

    environment_depth_belowTransducer: function(depth) {
        return { title: "DPT", value: to3Digits(depth) }
    },

    navigation_courseOverGroundMagnetic: function(course) {
        return { title: "MAG", value: leftpad(course.toFixed(0)) }
    },

    environment_wind_speedApparent: function(aws) {
        return { title: "AWS", value: to3Digits(aws) }
    },

    environment_wind_speedTrue: function(tws) {
        return { title: "TWS", value: to3Digits(tws) }
    },

    environment_wind_angleApparent: function(awa) {
        return { title: "AWA", value: to3Digits(Math.abs(awa * 180 / Math.PI)) }
    },

    environment_wind_angleTrueWater: function(twa) {
        return { title: "TWA", value: to3Digits(Math.abs(twa * 180 / Math.PI)) }
    }
}

function formatTitlePairForOutput(titleValue) {
    return `%${titleValue.title};${titleValue.value}`
}

function leftpad(value) {
    return String(value).padStart(3, " ")
}

function to3Digits(value) {
    return value.toPrecision(3).substring(0, 4)
}
