function mouseMove(e) {
    // location display
    var div = document.getElementById('coordinate');
    var x = e.offsetX;
    var y = e.offsetY;
    div.innerText = 'Current mouse location:(' + x + ',' + y + '). ' + 'Time:' + frame.pixelToSecond(x);


    var isDiagramChanged = false;
    // hit test
    var stationHitTestResult = stationViewHitTest({ 'X': x, 'Y': y });
    var trainHitTestResult = trainViewHitTest({ 'X': x, 'Y': y });
    var timeStampHitTestResult = timeStampViewHitTest({ 'X': x, 'Y': y });

    // redraw the diagram
    if (stationHitTestResult.isStatusChanged)
        display(cxt);  // hit test is not necessary to update position information.
    if (trainHitTestResult.isStatusChanged)
        display(cxt);
    if (timeStampHitTestResult.isStatusChanged)
        display(cxt);
}


// A general line hit test function.

function lineHitTest(mouseLocation, radius, line) {

    // test if the mouse location is in the rectangle form by the line as diagonal
    if (mouseLocation.X > line.endX + radius && mouseLocation.X > line.startX - radius)
        return false;
    if (mouseLocation.X < line.endX - radius && mouseLocation.X < line.startX + radius)
        return false;

    if (mouseLocation.Y > line.endY + radius  && mouseLocation.Y > line.startY - radius)
        return false;
    if (mouseLocation.Y < line.endY - radius && mouseLocation.Y < line.startY + radius)
        return false;

    var _A = line.endY - line.startY;
    var _B = line.startX - line.endX;
    var _C = line.endX * line.startY - line.startX * line.endY;

    // the distance from the mouse location to the current line
    var d = Math.abs(_A * mouseLocation.X + _B * mouseLocation.Y + _C) / Math.sqrt(_A * _A + _B * _B);

    if (d < radius)
        return true;
    else
        return false;
}


// Global station view hit test.

function stationViewHitTest(mouseLocation) {

    var infoDiv = document.getElementById('info');

    var isStatusChanged = false;  // To decide if the diagram should be redraw.
    var hitStationView = null;

    for (var k in frame.blockMap) {
        for (var s in frame.blockMap[k].stationViewList) {
            var stationView = frame.blockMap[k].stationViewList[s];
            if (stationView.hitTest(mouseLocation, 3) == true) {  // hit test is sucessful.
                infoDiv.innerText = 'Station view:' + stationView.stationObj.name;
                stationView.status = 'hit';
                hitStationView = stationView;
                isStatusChanged = true;
            }
            else {  // hit test failed.
                if (stationView.status == 'hit') {
                    stationView.status = 'normal';
                    isStatusChanged = true;
                }
            }
        }
    }
    if (hitStationView == null)
        infoDiv.innerText = '..';
    return { 'isStatusChanged': isStatusChanged, 'hitStationView': hitStationView };
}


// Global train view hit test.

function trainViewHitTest(mouseLocation) {
    var infoDiv = document.getElementById('info');

    var isStatusChanged = false;  // To decide if the diagram should be redraw.
    var hitTrainView = null;

    for (var trId in frame.trainViewMap) {
        var trView = frame.trainViewMap[trId];
        if (trView.hitTest(mouseLocation, 3)) {  // hit test is sucessful.
            var infoDiv = document.getElementById('info');
            infoDiv.innerText = 'Train view:' + trView.trainObj.id;
            hitTrainView = trView;

            trView.status = 'hit';

            isStatusChanged = true;
            break;
        }
        else {
            if (trView.status == 'hit') {
                trView.status = 'normal';
                isStatusChanged = true;
            }
        }
    }
    //if (hitTrainView == null)
        //infoDiv.innerText = '..';
    return { 'isStatusChanged': isStatusChanged, 'hitTrainView': hitTrainView };
}


// Global time stamp view hit test.

function timeStampViewHitTest(mouseLocation) {
    var isStatusChanged = false;
    var hitTimeStampView = null;

    for (var trId in frame.trainViewMap) {
        var trView = frame.trainViewMap[trId];

        for (var tsvId in trView.timeStampViewList) {
            var tsv = trView.timeStampViewList[tsvId];
            if (tsv.hitTest(mouseLocation, 3)) {
                var infoDiv = document.getElementById('info');
                infoDiv.innerText = 'Time stamp view:' + trView.trainObj.id + '--' + model.station_map[tsv.timeStamp.station].name + '-' + tsv.timeStamp.operation + ':' + tsv.timeStamp.time;
                hitTimeStampView = tsv;

                tsv.status = "hit";

                isStatusChanged = true;
                break;
            }
            else {
                if (tsv.status == 'hit') {
                    tsv.status = 'normal';
                    isStatusChanged = true;
                }
            }
        }
    }

    return { 'isStatusChanged': isStatusChanged, 'hitTimeStampView': hitTimeStampView };
}