// Get the canvas object

var c = document.getElementById("train_diagram");
var cxt = c.getContext("2d");

frame = new Frame({
    width: c.clientWidth,
    height: c.clientHeight,
});

// Global data handler

function input_data_handler() {
    var l1 = new Line('0', 'Jingguang1');
    model.line_map['0'] = l1;
    l1 = new Line('1', 'Jingguang2');
    model.line_map['1', l1];

    var b1 = new Block();
    frame.blockList.push(b1);

    var sta = new Station('0', 'BeijingXi', '0', '0', '0.0');
    model.station_map['0'] = sta;
    var staView = new StationView('0', sta, model.line_map['0'], b1, 0);
    b1.stationViewList.push(staView);
    frame.stationViewMap[sta.id] = [staView];

    sta = new Station('1', 'Shijiazhuang', '0', '1', '50.0');
    model.station_map['1'] = sta;
    staView = new StationView('1', sta, model.line_map['0'], b1, 1);
    b1.stationViewList.push(staView);
    frame.stationViewMap[sta.id] = [staView];

    sta = new Station('2', 'ZhengZhou', '0', '2', '80.0');
    model.station_map['2'] = sta;
    staView = new StationView('2', sta, model.line_map['0'], b1, 2);
    b1.stationViewList.push(staView);
    frame.stationViewMap[sta.id] = [staView];

    var b2 = new Block();
    frame.blockList.push(b2);

    sta = new Station('3', 'WuHan', '0', '0', '0');
    model.station_map['3'] = sta;
    staView = new StationView('3', sta, model.line_map['1'], b2, 0);
    b2.stationViewList.push(staView);
    frame.stationViewMap[sta.id] = [staView];

    sta = new Station('4', 'ChangshaNan', '0', '1', '30.0');
    model.station_map['4'] = sta;
    staView = new StationView('4', sta, model.line_map['1'], b2, 1);
    b2.stationViewList.push(staView);
    frame.stationViewMap[sta.id] = [staView];

    var tr = new Train('G1001', 'G', model.station_map['0'], model.station_map['4']);
    tr.lineList = [
    ];
    tr.timeTable = [
        new TimeStamp(tr, model.station_map['0'], 100, 'arrive'),
        new TimeStamp(tr, model.station_map['0'], 120, 'depart'),
        new TimeStamp(tr, model.station_map['1'], 220, 'arrive'),
        new TimeStamp(tr, model.station_map['1'], 290, 'depart'),
    ];
    model.train_map[tr.id] = tr;
    var trView = new TrainView(tr.id, tr);
    frame.trainViewList.push(trView);
    trView.generate();
    trView.update();
}


function paint() {
    updateView();
    display(cxt);
}


// The main procedure..

input_data_handler();
paint();

// test messages.
document.getElementById('info').innerHTML = "Finished!";