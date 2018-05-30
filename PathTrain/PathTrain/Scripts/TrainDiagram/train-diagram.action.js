// global mousemove response function

function mouseMove(e) {
    // location display
    var div = document.getElementById('coordinate');

    var x = e.offsetX;
    var y = e.offsetY;
    div.innerText = 'Current mouse location:(' + x + ',' + y + '). ' + 'Time:' + frame.pixelToSecond(x);

    if (frame.isAllowMoving) {
        moveDiagram_move({ 'x': x, 'y': y });
        return;
    }

    globalHit({ 'x': x, 'y': y });
    
}

// global mouse click response function

function mouseLeftClick(e) {
    var x = e.offsetX;
    var y = e.offsetY;

    if (frame.isAllowMoving) {
        return;
    }

    globalSelect({ 'x': x, 'y': y });
}

// global mouse down response function

function mouseDown(e) {
    if (frame.isAllowMoving) {
        moveDiagram_down({ 'x': e.offsetX, 'y': e.offsetY });
        return;
    }
}

// global mouse up response function

function mouseUp(e) {
    if (frame.isAllowMoving) {
        moveDiagram_up({ 'x': e.offsetX, 'y': e.offsetY });
        return;
    }
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
    var hitStationView = null;

    for (var k in frame.blockMap) {
        for (var s in frame.blockMap[k].stationViewList) {
            var stationView = frame.blockMap[k].stationViewList[s];
            if (stationView.hitTest(mouseLocation, 3) == true) {  // hit test is sucessful.
                hitStationView = stationView;
            }
        }
    }
    return hitStationView;
}

// Global train view hit test.

function trainViewHitTest(mouseLocation) {
    var infoDiv = document.getElementById('info');

    var hitTrainView = null;

    for (var trId in frame.trainViewMap) {
        var trView = frame.trainViewMap[trId];
        if (trView.hitTest(mouseLocation, 3)) {  // hit test is sucessful.
            hitTrainView = trView;
            break;
        }
    }
    return hitTrainView;
}

// Global time stamp view hit test.

function timeStampViewHitTest(mouseLocation) {
    var hitTimeStampView = null;

    for (var trId in frame.trainViewMap) {
        var trView = frame.trainViewMap[trId];

        for (var tsvId in trView.timeStampViewList) {
            var tsv = trView.timeStampViewList[tsvId];
            if (tsv.hitTest(mouseLocation, 3)) {
                hitTimeStampView = tsv;
                break;
            }
        }
    }
    return hitTimeStampView;
}

// global hit function

function globalHit(location) {

    var div = document.getElementById('coordinate');
    var infoDiv = document.getElementById('info');
    var isDiagramChanged = false;

    // hit test
    var stationHitResult = stationViewHit({ 'X': location.x, 'Y': location.y });
    var trainHitResult = trainViewHit({ 'X': location.x, 'Y': location.y });
    var timeStampHitResult = timeStampViewHit({ 'X': location.x, 'Y': location.y });

    // set or remove hit status
    if (stationHitResult != frame.hitStationView) {
        if (frame.hitStationView != null && frame.hitStationView.status != "selected") {
            frame.hitStationView.status = "normal";
        }
        frame.hitStationView = stationHitResult;
        if (stationHitResult != null && stationHitResult.status != "selected") {
            stationHitResult.status = "hit";
            infoDiv.innerText = 'Station view:' + stationHitResult.stationObj.name;
        }
        isDiagramChanged = true;
    }
    if (trainHitResult != frame.hitTrainView) {
        if (frame.hitTrainView != null && frame.hitTrainView.status != "selected") {
            frame.hitTrainView.status = "normal";
        }
        frame.hitTrainView = trainHitResult;
        if (trainHitResult != null && trainHitResult.status != "selected") {
            trainHitResult.status = "hit";
            infoDiv.innerText = 'Train view:' + trainHitResult.trainObj.id;
        }
        isDiagramChanged = true;
    }
    if (timeStampHitResult != frame.hitTimeStampView) {
        if (frame.hitTimeStampView != null) {
            frame.hitTimeStampView.status = "normal";
        }
        frame.hitTimeStampView = timeStampHitResult;
        if (timeStampHitResult != null) {
            timeStampHitResult.status = "hit";
            infoDiv.innerText = 'Time stamp view:' + timeStampHitResult.trainView.trainObj.id + '--' + model.station_map[timeStampHitResult.timeStamp.station].name + '-' + timeStampHitResult.timeStamp.operation + ':' + timeStampHitResult.timeStamp.time;
        }
        isDiagramChanged = true;
    }

    // redraw the diagram
    if (isDiagramChanged)
        frame.display(cxt);
}

function stationViewHit(mouseLocation) {
    var hitTestResult = stationViewHitTest(mouseLocation);
    if (hitTestResult != null) {
    }
    return hitTestResult;
}

function trainViewHit(mouseLocation) {
    var hitTestResult = trainViewHitTest(mouseLocation);
    if (hitTestResult != null) {
    }
    return hitTestResult;
}

function timeStampViewHit(mouseLocation) {
    var hitTestResult = timeStampViewHitTest(mouseLocation);
    if (hitTestResult != null) {
    }
    return hitTestResult;
}

// global select function

function globalSelect(location)
{
    var infoDiv = document.getElementById('info');

    var trainSelectResult = trainViewSelect({ 'X': location.x, 'Y': location.y });

    if (trainSelectResult != frame.selectedTrainView) {

        if (trainSelectResult != null) {
            trainSelectResult.status = "selected";
        }
        if (frame.selectedTrainView != null) {
            frame.selectedTrainView.status = "normal";
        }
        frame.selectedTrainView = trainSelectResult;
        if (trainSelectResult != null) {
            infoDiv.innerText = 'Selected Train view:' + trainSelectResult.trainObj.id;
        }
    }

    frame.display(cxt);
}

function trainViewSelect(mouseLocation) {
    var hitTestResult = trainViewHitTest(mouseLocation);
    if (hitTestResult != null) {
    }
    return hitTestResult;
}

// move the whole diagram

function moveDiagram_down(beginLocation){
    frame.isMoving = true;
    frame.beginMovingLocation = beginLocation;
}

function moveDiagram_move(currentLocation) {
    if (!frame.isMoving)
        return;
    frame.orgPosition.X = (frame.orgPosition.X + currentLocation.x - frame.beginMovingLocation.x);
    frame.orgPosition.Y = (frame.orgPosition.Y + currentLocation.y - frame.beginMovingLocation.y);
    frame.beginMovingLocation = currentLocation;
    frame.updateView();
    frame.display(cxt);
}

function moveDiagram_up(endLocation) {
    frame.isMoving = false;
    frame.beginMovingLocation = null;
}

// panorama view

function panorama() {
    var width = c.getAttribute('width');
    var height = c.getAttribute('height');

    frame.orgPosition = { 'X': frame.margin.left, 'Y': frame.margin.top };

    var ratio_x = (width - frame.margin.left - frame.margin.right) / frame.totalTimeInSecond;

    frame.zoomRatio.horizontial = ratio_x;
    frame.updateView();
    frame.display(cxt);
}