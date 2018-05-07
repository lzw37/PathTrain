// Get the canvas object

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
    updateView();
    display(cxt);
}


// The main procedure..

input_data_handler();
paint();

// test messages.
document.getElementById('info').innerHTML = "Finished!";