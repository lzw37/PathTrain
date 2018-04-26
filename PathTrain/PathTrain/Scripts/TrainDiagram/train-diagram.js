// Get the canvas object

var c = document.getElementById("train_diagram");
var cxt = c.getContext("2d");

// Fill the background

cxt.fillStyle = "#FF0000";
c.clientWidth
cxt.fillRect(0, 0, c.clientWidth, c.clientHeight);




// Global data handler

function input_data_handler() {
    var sta = new Station('0', 'BeijingXi', '0', '0', '0.0');
    model.station_map['0'] = sta;

    sta = new Station('1', 'Shijiazhuang', '0', '1', '50.0');
    model.station_map['1'] = sta;

    sta = new Station('2', 'ZhengZhou', '0', '2', '80.0');
    model.station_map['2'] = sta;
}




// The main procedure..

input_data_handler();
display();