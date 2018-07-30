// global mousemove response function

function mouseMove(e) {
    // location display
    var div = document.getElementById('coordinate');

    var x = e.offsetX;
    var y = e.offsetY;
    div.innerText = 'Current mouse location:(' + x + ',' + y + '). ' + 'Time:' + frame.pixelToSecond(x);

    if (frame.isAllowCustomZoom) {
        customZoom_move({ 'x': x, 'y': y });
        return;
    }

    if (frame.isAllowMoving) {
        moveDiagram_move({ 'x': x, 'y': y });
        return;
    }

    if (frame.editingTimeStampView != null) {
        edit_move({ 'x': x, 'y': y })
        return;
    }
    globalHit({ 'x': x, 'y': y });
}

// global mouse click response function

function mouseLeftClick(e) {
    var x = e.offsetX;
    var y = e.offsetY;

    globalSelect({ 'x': x, 'y': y });
}

// global mouse down response function

function mouseDown(e) {
    if (frame.isAllowCustomZoom) {
        customZoom_down({ 'x': e.offsetX, 'y': e.offsetY });
        return;
    }
    if (frame.isAllowMoving) {
        moveDiagram_down({ 'x': e.offsetX, 'y': e.offsetY });
        return;
    }
    if (frame.selectedTrainView != null) {
        var hitTimeStampView = timeStampViewHitTest({ 'X': e.offsetX, 'Y': e.offsetY });
        if (hitTimeStampView != null) {
            if (frame.selectedTrainView.timeStampViewList.indexOf(hitTimeStampView) != -1)
                edit_down(hitTimeStampView, { 'x': e.offsetX, 'y': e.offsetY });
        }
        return;
    }
}

// global mouse up response function

function mouseUp(e) {
    if (frame.isAllowCustomZoom) {
        customZoom_up({ 'x': e.offsetX, 'y': e.offsetY });
        return;
    }
    if (frame.isAllowMoving) {
        moveDiagram_up({ 'x': e.offsetX, 'y': e.offsetY });
        return;
    }
    if (frame.editingTimeStampView != null) {
        edit_up({ 'x': e.offsetX, 'y': e.offsetY });
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

    if (mouseLocation.Y > line.endY + radius && mouseLocation.Y > line.startY - radius)
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

    if (frame.selectedTrainView != null) {
        var trView = frame.selectedTrainView;
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

function globalSelect(location) {
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

function moveDiagram_down(beginLocation) {
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

    // update original position
    frame.orgPosition = { 'X': frame.margin.left, 'Y': frame.margin.top };

    // update horizontial ratio
    var ratio_x = (width - frame.margin.left - frame.margin.right) / frame.totalTimeInSecond;

    // update vertical ratio
    var blockMarginSum = 0;
    for (var b in frame.blockMap) {
        blockMarginSum += frame.blockMap[b].margin
    }
    blockMarginSum -= frame.blockMap[b].margin;
    var ratio_y = (height - frame.margin.top - frame.margin.bottom) / frame.totalDiagramMiles;

    frame.zoomRatio.horizontial = ratio_x;
    frame.zoomRatio.vertical = ratio_y;
    frame.updateView();
    frame.display(cxt);
}

// custom zoom

function customZoom_down(beginLocation) {
    frame.isCustomZooming = true;
    frame.beginZoomingLocation = beginLocation;
}

function customZoom_up(endLocation) {
    if(!frame.isCustomZooming)
        return;
    customZoom_execute(frame.beginZoomingLocation, endLocation);
    frame.isCustomZooming = false;
    frame.beginZoomingLocation = null;
    frame.updateView();
    frame.display(cxt);
    //frame.isAllowCustomZoom = false;
}

function customZoom_drawRectangle(beginLocation, endLocation, cxt) {

    var zoomRect = customZoom_generateRectangle(beginLocation, endLocation);

    cxt.strokeStyle = frame.style.customRectangleStyle.color;
    cxt.lineWidth = frame.style.customRectangleStyle.lineWidth;
    cxt.beginPath();
    cxt.rect(zoomRect.x, zoomRect.y, zoomRect.width, zoomRect.height);
    cxt.stroke();
}

function customZoom_generateRectangle(beginLocation, endLocation){
    var zoomRect = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    }

    if (endLocation.x >= beginLocation.x) {
        zoomRect.x = beginLocation.x;
        zoomRect.width = endLocation.x - beginLocation.x;
    }
    else {
        zoomRect.x = endLocation.x;
        zoomRect.width = beginLocation.x - endLocation.x;
    }

    if (endLocation.y >= beginLocation.y) {
        zoomRect.y = beginLocation.y;
        zoomRect.height = endLocation.y - beginLocation.y;
    }
    else {
        zoomRect.y = endLocation.y;
        zoomRect.height = beginLocation.y - endLocation.y;
    }

    return zoomRect;
}

function customZoom_execute(beginLocation, endLocation) {

    var width = c.getAttribute('width');
    var height = c.getAttribute('height');

    var zoomRect = customZoom_generateRectangle(beginLocation, endLocation);

    var newHorizontial = width / zoomRect.width * frame.zoomRatio.horizontial;
    var newVertical = height / zoomRect.height * frame.zoomRatio.vertical;

    frame.orgPosition.X = frame.orgPosition.X - (zoomRect.x - frame.orgPosition.X) / frame.zoomRatio.horizontial * newHorizontial;
    frame.orgPosition.Y = frame.orgPosition.Y - (zoomRect.y - frame.orgPosition.Y) / frame.zoomRatio.vertical * newVertical;

    frame.zoomRatio.vertical = newVertical;
    frame.zoomRatio.horizontial = newHorizontial;
}

function customZoom_move(currentLocation) {
    if (!frame.isCustomZooming)
        return;
    frame.display(cxt);
    customZoom_drawRectangle(frame.beginZoomingLocation, currentLocation, cxt);
}

// Edit timestamps

var editingCommand;
var editingStartSecond;

function edit_down(timeStampView, startLocation) {
    editingCommand = new EditCommand(frame.selectedTrainView.trainObj, frame.selectedTrainView.trainObj.timeTable);
    editingStartSecond = frame.pixelToSecond(startLocation.x);
    frame.editingTimeStampView = timeStampView;
}

function edit_move(location) {
    var currentSecond = frame.pixelToSecond(location.x);
    frame.editingTimeStampView.timeStamp.time = currentSecond;
    edit_moveFollowingTimeStamps(currentSecond);
    frame.updateView();
    frame.display(cxt);
}

function edit_moveFollowingTimeStamps(currentSecond) {
    var deltaSecond = currentSecond - editingStartSecond;
    var isTimeStampViewFound = false;
    for (var i in frame.selectedTrainView.timeStampViewList) {
        if (!isTimeStampViewFound
            && frame.selectedTrainView.timeStampViewList[i] != frame.editingTimeStampView)
            continue;
        else if (frame.selectedTrainView.timeStampViewList[i] == frame.editingTimeStampView) {
            isTimeStampViewFound = true;
            continue;
        }
        else {
            if (frame.selectedTrainView.timeStampViewList[i].type == "virtual")
                continue;
            var newTime = parseInt(frame.selectedTrainView.timeStampViewList[i].timeStamp.time) + deltaSecond;
            frame.selectedTrainView.timeStampViewList[i].timeStamp.time = newTime;
        }
    }
    editingStartSecond = currentSecond;
}

function edit_up(endLocation) {
    frame.editingTimeStampView = null;
    editingCommand.do();
    editingCommand = null;
}