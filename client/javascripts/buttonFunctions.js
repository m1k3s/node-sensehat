function doRainbow() {
    $(document).ready(function() {
        $.post("/rainbow");
    });
}

function notImplemented() {
    $(document).ready(function() {
        alert("This button function is not implemented");
    });
}

function getOrientation() {
    $.getJSON("/orientation", function(result) {
        console.log(result);
        //alert("pitch: " + result.imu.pitch);
        let pitch = (result.imu.pitch).toLocaleString('en-US', {minimumFractionDigits: 2});
        let roll = (result.imu.roll).toLocaleString('en-US', {minimumFractionDigits: 2});
        let yaw = (result.imu.yaw).toLocaleString('en-US', {minimumFractionDigits: 2});
        let str = "Current Orientation: pitch: " + pitch + "&deg;, roll: " + roll + "&deg;, yaw: " + yaw + "&deg;";

        document.getElementById("orientation").innerHTML = str;
    });
}

function getLoadAvg() {
    $.getJSON("/loadavg", function(result) {
        console.log(result);
        let one = result.loadavg.one;
        let five = result.loadavg.five;
        let fifteen = result.loadavg.fifteen;
        let str = "Server Load: " + one + ", " + five + ", " + fifteen;

        document.getElementById("loadavg").innerHTML = str;
    });
}

