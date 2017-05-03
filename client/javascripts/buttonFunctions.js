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

function getServerInfo() {
    $.getJSON("/serverinfo", function(result) {
        console.log(result);
        let one = result.serverinfo.loadavg.one;
        let five = result.serverinfo.loadavg.five;
        let fifteen = result.serverinfo.loadavg.fifteen;
        let str0 = "Server Load: " + one + ", " + five + ", " + fifteen;

        let pitch = (result.serverinfo.imu.pitch).toLocaleString('en-US', {minimumFractionDigits: 2});
        let roll = (result.serverinfo.imu.roll).toLocaleString('en-US', {minimumFractionDigits: 2});
        let yaw = (result.serverinfo.imu.yaw).toLocaleString('en-US', {minimumFractionDigits: 2});
        let str1 = "Current Orientation: pitch: " + pitch + "&deg;, roll: " + roll + "&deg;, yaw: " + yaw + "&deg;";

        let sys = result.serverinfo.node.sys;
        let node = result.serverinfo.node.node;
        let kernel = result.serverinfo.node.kernel;
        let march = result.serverinfo.node.march;
        let str2 = sys + " " + kernel + " " + march;
        let str3 = "== " + node + " ==";
        document.getElementById("host").innerHTML = str3;
        document.getElementById("banner").innerHTML = str2;
        document.getElementById("orientation").innerHTML = str1;
        document.getElementById("loadavg").innerHTML = str0;
    });
}


