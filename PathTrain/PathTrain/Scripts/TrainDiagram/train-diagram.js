// Get the canvas object

var c = document.getElementById("train_diagram");
var cxt = c.getContext("2d");


// Fill the background

cxt.fillStyle = "#FF0000";
c.clientWidth
cxt.fillRect(0, 0, c.clientWidth, c.clientHeight);


// Global data handler

function input_data_handler() {
    var b1 = new Block();
    frame.blockList.push(b1);

    var sta = new Station('0', 'BeijingXi', '0', '0', '0.0');
    model.station_map['0'] = sta;
    var staView = new StationView(sta, b1, 0);
    b1.stationViewList.push(staView);

    sta = new Station('1', 'Shijiazhuang', '0', '1', '50.0');
    model.station_map['1'] = sta;
    staView = new StationView(sta, b1, 1);
    b1.stationViewList.push(staView);

    sta = new Station('2', 'ZhengZhou', '0', '2', '80.0');
    model.station_map['2'] = sta;
    staView = new StationView(sta, b1, 2);
    b1.stationViewList.push(staView);

    sta = new Station('3', 'WuHan', '0', '3', '110.0');
    model.station_map['3'] = sta;
    staView = new StationView(sta, b1, 3);
    b1.stationViewList.push(staView);
}


// The main procedure..

frame = new Frame({
    width: c.clientWidth,
    height: c.clientHeight,
});

input_data_handler();


updateView();
display(cxt);