﻿// Get the canvas object

var c = document.getElementById("train_diagram");
var cxt = c.getContext("2d");

frame = new Frame({
    width: c.clientWidth,
    height: c.clientHeight,
});

// Global data handler

function input_data_handler() {

    //if (window.File && window.FileReader && window.FileList && window.Blob) {
    //    // Great success! All the File APIs are supported.
    //} else {
    //    alert('The File APIs are not fully supported in this browser.');
    //}

    // model data

    htmlobj = $.ajax({ url: "Local_Data/model_data.json", async: false });
    model = JSON.parse(htmlobj.responseText);
   

    // view data

    htmlobj = $.ajax({ url: "Local_Data/view_data.json", async: false });
    viewdata = JSON.parse(htmlobj.responseText);


    // style data
    //htmlobj = $.ajax({ url: "Local_Data/display_style.json", async: false });
    //frame.style = JSON.parse(htmlobj.responseText)["default"];
    //frame.style = JSON.parse(htmlobj.responseText)["custom"];

    // block
    for (var kId in viewdata.blockMap) {
        var k = viewdata.blockMap[kId];
        var block = new Block(k.id);
        frame.blockMap[k.id] = block;
    }

    // station view
    for (var staObjId in viewdata.stationViewMap) {
        frame.stationViewMap[staObjId] = [];
        for (var i in viewdata.stationViewMap[staObjId]) {
            var n = viewdata.stationViewMap[staObjId][i];
            var staView = new StationView(n.id, n.stationObjId, n.lineObjId, n.blockId, n.sequence, n.milesInBlock);
            frame.blockMap[n.blockId].stationViewList.push(staView);
            frame.stationViewMap[n.stationObjId].push(staView);
        }
    }

    // time line view
    for (var t = 0; t < frame.totalTimeInSecond;
        t += frame.style.timeLineStepSize[frame.displaySettings.timeLineMode]) {
        var tl = new TimeLine(t);
        frame.timeLineList.push(tl);

        //for (var k in frame.blockMap) {
        //    var block = frame.blockMap[k];

        //    tl.lineSection.push(lineSection);
        //}
    }

    // train view
    for (var trId in model.train_map) {
        var trObj = model.train_map[trId];
        var trView = new TrainView(trObj.id, trObj);
        frame.trainViewMap[trObj.id] = trView;
        trView.generate();
        trView.update();
    }
}


function paint() {
    frame.updateView();
    frame.display(cxt);
}

// controls

// range control

$('input[type="range"]').on('input', function (e) {
    var value = e.target.value;
    document.getElementById('info').innerHTML = value;

    switch (e.target.id) {
        case 'ratio_X': {
            frame.setDisplayRatio_X(value);
            document.getElementById('info').innerHTML = value;
            break;
        }
        case 'ratio_Y': {
            frame.setDisplayRatio_Y(value);
            document.getElementById('info').innerHTML = value;
            break;
        }
        case 'position_X': {
            frame.setDisplayPosition_X(value);
            document.getElementById('info').innerHTML = value;
            break;
        }
        case 'position_Y': {
            frame.setDisplayPosition_Y(value);
            document.getElementById('info').innerHTML = value;
            break;
        }
    }
    paint();
});

// mouse move control

$('#btn-move-by-mouse').on('click', function (e) {
    if (!frame.isAllowMoving)
        frame.isAllowMoving = true;
    else
        frame.isAllowMoving = false;
});

// panorama

$('#btn-panorama').on('click', function (e) {
    panorama();
});

// custom zoom

$('#btn-custom-zoom').on('click', function (e) {
    if (!frame.isAllowCustomZoom)
        frame.isAllowCustomZoom = true;
    else
        frame.isAllowCustomZoom = false;
})

// test add train command

$('#add-command').on('click', function (e) {
    var trainObj = new Train();
    trainObj.id = "G3001";
    trainObj.type = "G";
    trainObj.originalStation = "0";
    trainObj.destinationStation = "4";
    trainObj.lineList = ["0"];
    trainObj.timeTable.push({
        "train": "G3001",
        "station": "0",
        "time": "6100",
        "operation": "arrive"
    });
    trainObj.timeTable.push({
        "train": "G3001",
        "station": "0",
        "time": "7200",
        "operation": "depart"
    });
    trainObj.timeTable.push({
        "train": "G3001",
        "station": "1",
        "time": "8200",
        "operation": "arrive"
    });
    trainObj.timeTable.push({
        "train": "G3001",
        "station": "1",
        "time": "8900",
        "operation": "depart"
    });

    var add_cmd = new AddCommand(trainObj);
    add_cmd.do();
});

// test delete train command

$("#delete-command").on('click', function (e) {
    var delete_cmd = new DeleteCommand(model.train_map["G1003"]);
    delete_cmd.do();
});

// revoke the last command.
$("#revoke-command").on('click', function (e) {
    if (doneCommandList.length != 0)
        doneCommandList[doneCommandList.length - 1].revoke();
})

// redo the latest revoked command.

$("#redo-command").on('click', function (e) {
    if (redoCommandList.length != 0)
        redoCommandList[redoCommandList.length - 1].redo();
})

// The main procedure..

input_data_handler();
paint();

// test messages.
document.getElementById('info').innerHTML = "Finished!";