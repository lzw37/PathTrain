// Define the display style of the whole diagram

function DisplayStyle() {
    this.styleName = 'Default';

    this.background = '#e5f7ff';

    this.stationViewStyle = {
        'normal': {
            'color': '#009900',
            'width': '2',
        },
        'hit': {
            'color': ' #00e600',
            'width': '2',
        }
    }

    this.timeLineStepSize = {
        '_10min': 600,
        '_60min': 3600,
    }

    this.timeLineStyle = {
        'default': {
            'color': '#009900',
            'width': '1',
        },
        'hour': {
            'color': '#009900',
            'width': '2.5',
        },
        '_30min': {
            'color': '#009900',
            'width': '1',
        },
        '_10min': {
            'color': '#009900',
            'width': '1',
        }
    }

    this.trainViewStyle = {
        color: {
            'G': '#ff0000'
        },
        width: {
            normal: {
                'G': '2'
            },
            hit: {
                'G': '3'
            },
            selected: {
                'G': '4'
            }
        },
    }

    this.overBlockLineStyle = {
        color: '#3b43e2',
        width: '1'
    }

    this.timeStampViewStyle = {
        color: {
            'G': '#ff0000'
        },
        fillColor: {
            'hit': '#ffffff'
        },
        radius: 4,
        width: 1
    }

    this.trainIDMaxWidth = 40;

    this.customRectangleStyle = {
        lineWidth: 2,
        color: '#000000',
    }
}


// The frame of the whole diagram

function Frame(size) {
    this.size = size;  // The size of the canvas client rectangle.

    this.blockMap = {};  // The block list.
    this.timeLineList = [];  // The time line list.
    this.trainViewMap = {};  // The train view list.
    this.stationViewMap = {};  // {stationObj, [{blockID, stationViewID}]}

    this.style = new DisplayStyle();

    this.displaySettings = {
        timeLineMode: '_10min',
    }

    this.margin = {  // Margin parameters of the panorama view.
        left: 30,
        right: 30,
        top: 30,
        bottom: 30,
    };

    this.totalTimeInSecond = 86400;  // The total length of the time horizon (in seconds).
    this.totalDiagramMiles = 0;

    // Full diagram rectangle
    var currentFrame = this;
    this.innerRectangle = {
        left: function () {
            return currentFrame.margin.left;
        },
        right: function () {
            return currentFrame.size.width - currentFrame.margin.left - currentFrame.margin.right;
        },
        top: function () {
            return currentFrame.margin.top
        },
        bottom: function () {
            return currentFrame.size.height - currentFrame.margin.top - currentFrame.margin.bottom;
        }
    }

    // The coordinates of the original point.
    this.orgPosition = {
        X: 20,
        Y: 20,
    }

    // Transfer parameters between pixels and specific values.
    this.zoomRatio = {
        horizontial: 0.1/*0.016*/,  // pixel per second
        vertical: 2.5, // pixel per miles
    }

    // Transfer pixel value (X coordinate) to seconds. 
    this.pixelToSecond = function (pixel) {
        return Math.round((pixel - this.orgPosition.X) / this.zoomRatio.horizontial);
    }

    // Transfer seconds back to pixel value (X coordinate).

    this.secondToPixel = function (second) {
        return Math.round(this.orgPosition.X + this.zoomRatio.horizontial * second) + 0.5;
    }

    // action vars of the frame

    this.hitTrainView = null;
    this.hitStationView = null;
    this.hitTimeStampView = null;
    this.selectedTrainView = null;
    this.editingTimeStampView = null;

    // display ratio setting / getting function

    this.getDisplayRatio_X = function () {
        return this.zoomRatio.horizontial;
    }
    this.setDisplayRatio_X = function (value) {
        this.zoomRatio.horizontial = value / 500;
    }
    this.getDisplayRatio_Y = function () {
        return this.zoomRatio.vertical;
    }
    this.setDisplayRatio_Y = function (value) {
        this.zoomRatio.vertical = value / 20;
    }

    // position setting / getting function

    this.getDisplayPosition_X = function () {
        return this.orgPosition.X;
    }
    this.setDisplayPosition_X = function (value) {
        this.orgPosition.X = parseInt(value) * 20;
    }
    this.getDisplayPosition_Y = function () {
        return this.orgPosition.Y;
    }
    this.setDisplayPosition_Y = function (value) {
        this.orgPosition.Y = parseInt(value) * 20;
    }

    // move diagram status

    this.isAllowMoving = false;
    this.isMoving = false;
    this.beginMovingLocation = null;

    // custom zoom status
    this.isAllowCustomZoom = false;
    this.isCustomZooming = false;
    this.beginZoomingLocation = null;


    // The main function for reflash the diagram

    this.display = function (cxt) {
        // Fill the background
        cxt.fillStyle = this.style.background;
        c.clientWidth
        cxt.fillRect(0, 0, c.clientWidth, c.clientHeight);

        // draw diagram.
        for (var k in this.blockMap) {
            this.blockMap[k].draw(cxt);
        }

        for (var tl in this.timeLineList) {
            this.timeLineList[tl].draw(cxt);
        }

        for (var tr in frame.trainViewMap) {
            this.trainViewMap[tr].draw(cxt);
        }
    }

    // Update the whole train diagram.

    this.updateView = function () {

        // Update the position of blocks and station views.

        var currentY = this.orgPosition.Y;
        this.totalDiagramMiles = 0;
        for (var k in this.blockMap) {
            var block = this.blockMap[k];
            block.update(currentY);
            currentY = block.bottom + block.marginForMiles * frame.zoomRatio.vertical;
            this.totalDiagramMiles += block.totalMiles;
        }
        currentY = currentY - block.marginForMiles;

        // Update the time lines.
        for (var tl in this.timeLineList) {
            var timeLineView = this.timeLineList[tl];
            timeLineView.update();
        }

        // Update train views.
        for (var trvIdx in this.trainViewMap) {
            var trView = this.trainViewMap[trvIdx];
            trView.update();
        }

        // Update train id label distance
        this.updateTrainIDLabel();
    }

    // update the position of the train ID

    this.updateTrainIDLabel = function () {
        var fixTsvList = [];
        var candidateTsvList = [];
        for (var tsv in this.trainViewMap) {
            candidateTsvList.push(this.trainViewMap[tsv]);
        }

        var i = 0;

        while (candidateTsvList.length != 0) {
            if (!this.isConflict(candidateTsvList[i], fixTsvList)) {
                fixTsvList.push(candidateTsvList[i]);
                candidateTsvList.splice(i, 1);
            }
            else {
                i++;
            }
            if (i == candidateTsvList.length) {
                for (var tsv in candidateTsvList) {
                    candidateTsvList[tsv].increaseTrainIDDistance();
                }
                i = 0;
            }
        }
    }

    this.isConflict = function (tsv, fixTsvList) {
        for (var tsv2Idx in fixTsvList) {
            if (tsv.timeStampViewList[0].stationView == fixTsvList[tsv2Idx].timeStampViewList[0].stationView &&
                tsv.trainIDDistance == fixTsvList[tsv2Idx].trainIDDistance &&
                Math.abs(tsv.timeStampViewList[0].X - fixTsvList[tsv2Idx].timeStampViewList[0].X) < frame.style.trainIDMaxWidth)
                return true;
        }
        return false;
    }
}


// LineViewInstructor: define the Station - StationView mapping relations.

function LineViewInstructor(lineObj) {
    this.lineObj = lineObj;
    this.stationViewMap = {}  // {Object <Station>: Object <StationView>}
}


// Block: a view object of a independent train diagram block

function Block(id) {
    this.id = id;
    this.stationViewList = [];  // Station view list of the block.

    // Position attributes
    this.marginForMiles = 30;  // Margin size for this block in the top and the bottom.
    this.top = 0;
    this.bottom = 0;
    this.left = function () {
        return frame.orgPosition.X;
    }
    this.right = function () {
        return frame.orgPosition.X + frame.totalTimeInSecond * frame.zoomRatio.horizontial;
    }
    this.totalMiles = 0;
    // update parameters of the current block and its children elements.
    this.update = function (currentY) {
        this.top = currentY;
        for (var s in this.stationViewList) {
            this.stationViewList[s].update(currentY);
        }
        this.bottom = this.stationViewList[this.stationViewList.length - 1].Y;
        this.totalMiles = parseFloat(this.stationViewList[s].milesInBlock);
        this.totalMiles += this.marginForMiles;
    }
    // draw the block and its elements.
    this.draw = function (cxt) {
        for (var s in this.stationViewList) {
            this.stationViewList[s].draw(cxt);
        }
    }
}


// TimeLine: a view object of the time line in the diagram

function TimeLine(t) {
    this.time = t;  // in second
    this.X = 0;
    this.lineSection = []; // {startY:value, endY:value}, depending on the position (top and bottom) of each block
    this.lineType = 'default';

    // Update the position of the time line.
    this.update = function () {
        this.X = frame.secondToPixel(this.time);

        // Define the line section by blocks.
        this.lineSection = [];
        for (var k in frame.blockMap) {
            var block = frame.blockMap[k];
            var lineSection = {
                startY: block.top,
                endY: block.bottom,
            }
            this.lineSection.push(lineSection);
        }

        // Define the line type by the time.
        if (this.time % 3600 == 0) {
            this.lineType = 'hour';
        }
        else if (this.time % 1800 == 0) {
            this.lineType = '_30min';
        }
        else if (this.time % 600 == 0) {
            this.lineType = '_10min';
        }
    }

    // Draw the time line.
    this.draw = function (cxt) {
        var currentStationViewStyle = frame.style.timeLineStyle[this.lineType];
        cxt.lineWidth = currentStationViewStyle['width'];
        cxt.strokeStyle = currentStationViewStyle['color'];
        if (this.lineType == '_30min') {  // A 30 min line should be a dashed line.
            cxt.setLineDash([5]);
        }
        else {
            cxt.setLineDash([]);
        }
        for (var s in this.lineSection) {
            var section = this.lineSection[s];
            cxt.beginPath();
            cxt.moveTo(this.X, section.startY);
            cxt.lineTo(this.X, section.endY);
            cxt.closePath();
            cxt.stroke();
        }
    }
}


// StationView: a view object of the station line in the diagram

function StationView(id, stationObjId, lineObjId, blockId, sequence, milesInBlock) {
    this.id = id;
    // Structure attributes
    this.stationObj = model.station_map[stationObjId];
    this.lineObj = model.line_map[lineObjId];
    this.block = frame.blockMap[blockId];
    this.sequence = sequence;
    this.milesInBlock = milesInBlock;

    // Status attribute
    this.status = 'normal';

    // Position attributes
    this.Y = 0;
    this.left = 0;
    this.right = 0;

    // Update the current station view.
    this.update = function (blockTop) {
        this.Y = Math.round(blockTop + frame.zoomRatio.vertical * this.milesInBlock) + 0.5;
        this.left = this.block.left();
        this.right = this.block.right();
    }

    // Draw the current station view.
    this.draw = function (cxt) {
        var currentStationViewStyle = frame.style.stationViewStyle[this.status];
        cxt.beginPath();
        cxt.lineWidth = currentStationViewStyle['width'];
        cxt.strokeStyle = currentStationViewStyle['color'];
        cxt.moveTo(this.left, this.Y);
        cxt.lineTo(this.right, this.Y);
        cxt.closePath();
        cxt.stroke();
    }

    // Hit test of the station view.
    this.hitTest = function (mouseLocation, radius) {
        return lineHitTest(mouseLocation, radius, { startX: this.left, startY: this.Y, endX: this.right, endY: this.Y });
    }
}


// TrainView: a view object of a train path

function TrainView(id, trainObj) {
    this.trainObj = trainObj;
    this.stationViewList = [];  // in the drawing sequence
    this.timeStampViewList = []; // in the drawing sequence
    this.pathList = [];  // in the drawing sequence. 

    this.status = 'normal';

    this.trainIDDistance = 0;

    this.generate = function () {

        this.stationViewList = [];
        this.timeStampViewList = [];
        this.pathList = [];

        // generate the relative timeStampViewList by the trainObj.timeStampList
        for (var stampIdx in trainObj.timeTable) {
            var sta = model.station_map[trainObj.timeTable[stampIdx].station];
            var staViewList = frame.stationViewMap[sta.id];

            if (staViewList.length == 1) {
                // only one station view is found.
                var staView = staViewList[0];
                this.stationViewList.push(staView);

                var timeStampView = new TimeStampView(this, staView, trainObj.timeTable[stampIdx], 'available');
                this.timeStampViewList.push(timeStampView);
            }
            else {
                // more than one station views are found.
                var currentStaViewCount = 0;
                for (var lId in this.trainObj.lineList) {
                    var l = model.line_map[this.trainObj.lineList[lId]];
                    for (var svId in staViewList) {
                        // select the display StationView by the line list.
                        var staView = staViewList[svId];
                        if (l == staView.lineObj) {
                            this.stationViewList.push(staView);

                            // the first 'StationView' object is the available one, while the others are virtual ones.
                            currentStaViewCount++;
                            var type = 'available';
                            if (currentStaViewCount > 1) {
                                if (trainObj.timeTable[stampIdx].operation == 'depart') { // only display depart virtual timestamp
                                    type = 'virtual';
                                }
                                else {
                                    continue;
                                }
                            }

                            var timeStampView = new TimeStampView(this, staView, trainObj.timeTable[stampIdx], type);
                            this.timeStampViewList.push(timeStampView);
                        }
                    }
                }
            }
        }

        // generate path list.
        if (this.timeStampViewList.length < 2) {
            return;
        }
        var lastTsView = this.timeStampViewList[0];
        for (var i = 1; i < this.timeStampViewList.length; i++) {
            var tsView = this.timeStampViewList[i];
            if ((lastTsView.type == "available" && tsView.type == "available") ||
                (lastTsView.type == "virtual" && tsView.type == "available")) {  // running line or dwelling line
                if (lastTsView.timeStamp.operation == "depart" &&
                    tsView.timeStamp.operation == "arrive") {
                    var l = new RunningLine(this, lastTsView, tsView);
                    this.pathList.push(l);
                }
                else if (lastTsView.timeStamp.operation == "arrive" &&
                    tsView.timeStamp.operation == "depart") {
                    var l = new DwellingLine(this, lastTsView, tsView);
                    this.pathList.push(l);
                }
            }
            else {  // overblock line
                var l = new OverBlockLine(this, lastTsView, tsView);
                this.pathList.push(l);
            }
            lastTsView = tsView;
        }
    }

    this.hitTest = function (mouseLocation, radius) {
        for (var lId in this.pathList) {
            var l = this.pathList[lId];
            if (l.hitTest(mouseLocation, radius))
                return true;
        }
        return false;
    }

    this.update = function () {

        // update train ID distance
        this.trainIDDistance = 15;

        // update time stamp view
        for (var tsvIdx in this.timeStampViewList) {
            var tsv = this.timeStampViewList[tsvIdx];
            tsv.update();
        }
    }

    this.increaseTrainIDDistance = function () {
        this.trainIDDistance += 15;
    }

    this.draw = function (cxt) {

        var currentTrainViewStyle = frame.trainViewStyle
        //cxt.beginPath();
        cxt.lineWidth = frame.style.trainViewStyle.width[this.status][this.trainObj.type];
        cxt.strokeStyle = frame.style.trainViewStyle.color[this.trainObj.type];
        cxt.fillStyle = frame.style.trainViewStyle.color[this.trainObj.type];

        // draw train name
        this.drawTrainName(cxt);

        // draw a sectional path by the time stamps.
        for (var l in this.pathList) {
            this.pathList[l].draw(cxt);
        }
        //cxt.closePath();
        cxt.stroke();

        // draw all time stamp views.
        if (this.status == "selected") {
            this.drawTimeStampViews(cxt);
        }
    }

    this.drawTrainName = function (cxt) {

        var firstTsv = this.timeStampViewList[0];
        var x = firstTsv.X;

        var textBaseLine = 0;
        var textMaxWidth = frame.style.trainIDMaxWidth;
        var y = 0;
        if (this.timeStampViewList[1] != null &&
            this.timeStampViewList[2] != null &&
            this.timeStampViewList[1].Y < this.timeStampViewList[2].Y) {
            y = firstTsv.Y - this.trainIDDistance;
            textBaseLine = y - 3;
        }
        else {
            y = firstTsv.Y + this.trainIDDistance;
            textBaseLine = y + 15;
        }

        // draw the label
        cxt.beginPath();
        cxt.moveTo(x - textMaxWidth / 2, y);
        cxt.lineTo(x + textMaxWidth / 2, y);
        cxt.moveTo(firstTsv.X, firstTsv.Y);
        cxt.lineTo(firstTsv.X, y);
        cxt.closePath();
        cxt.stroke();

        // fill text
        cxt.font = "15px Helvetica";
        cxt.fillText(this.trainObj.id, x - textMaxWidth / 2, textBaseLine, textMaxWidth);
    }



    this.drawTimeStampViews = function (cxt) {
        cxt.beginPath();
        cxt.strokeStyle = frame.style.timeStampViewStyle.color[this.trainObj.type];
        cxt.lineWidth = frame.style.timeStampViewStyle.width;
        for (var tsvIdx in this.timeStampViewList) {
            var tsv = this.timeStampViewList[tsvIdx];
            tsv.draw(cxt, frame.style.timeStampViewStyle.radius);
        }
        cxt.closePath();
        cxt.stroke();
        cxt.fill();
    }
}


// TimeStampView: a view object of the time label of train operations (arrival or departure)

function TimeStampView(trainView, stationView, timeStamp, type) {
    this.stationView = stationView
    this.trainView = trainView;
    this.timeStamp = timeStamp;
    this.type = type;

    this.X = 0;
    this.Y = 0;

    this.status = "normal";

    this.hitTest = function (mouseLocation, radius) {
        if (this.type == "virtual")
            return false;

        var d = Math.sqrt(Math.pow((mouseLocation.X - this.X), 2) + Math.pow((mouseLocation.Y - this.Y), 2));
        if (d <= radius)
            return true;
        else
            return false;
    }

    this.update = function () {
        // ensure the consistancy of the positions for TimeStampView and StationView
        this.X = frame.secondToPixel(this.timeStamp.time);
        this.Y = this.stationView.Y;
    }

    this.draw = function (cxt, radius) {
        if (this.type == "virtual")
            return;
        if (this.status != "normal") {
            cxt.closePath();
            cxt.stroke();
            cxt.fill();

            cxt.beginPath();
            cxt.fillStyle = frame.style.timeStampViewStyle.fillColor[this.status];
            cxt.moveTo(this.X, this.Y);
            cxt.arc(this.X, this.Y, radius, 0, 2 * Math.PI);
            cxt.closePath();
            cxt.stroke();
            cxt.fill();

            cxt.beginPath();
            cxt.fillStyle = frame.style.timeStampViewStyle.color[this.trainView.trainObj.type];
        }
        else {
            cxt.moveTo(this.X, this.Y);
            cxt.arc(this.X, this.Y, radius, 0, 2 * Math.PI);
        }
    }
}


// The running line sections of train paths.

function RunningLine(trainView, foreTimeStampView, rareTimeStampView) {
    this.trainView = trainView;
    this.foreTimeStampView = foreTimeStampView;
    this.rareTimeStampView = rareTimeStampView;

    this.draw = function (cxt) {
        if (this.foreTimeStampView.X > this.rareTimeStampView.X)
            return;
        cxt.beginPath();
        cxt.moveTo(this.foreTimeStampView.X, this.foreTimeStampView.Y);
        cxt.lineTo(this.rareTimeStampView.X, this.rareTimeStampView.Y);
        cxt.closePath();
        cxt.stroke();
    }

    this.hitTest = function (mouseLocation, radius) {
        return lineHitTest(mouseLocation, radius, {
            startX: this.foreTimeStampView.X,
            startY: this.foreTimeStampView.Y,
            endX: this.rareTimeStampView.X,
            endY: this.rareTimeStampView.Y
        });
    }
}


// The dwelling line sections of train paths.

function DwellingLine(trainView, foreTimeStampView, rareTimeStampView) {
    this.trainView = trainView;
    this.foreTimeStampView = foreTimeStampView;
    this.rareTimeStampView = rareTimeStampView;

    this.draw = function (cxt) {
        cxt.beginPath();
        cxt.moveTo(this.foreTimeStampView.X, this.foreTimeStampView.Y);
        cxt.lineTo(this.rareTimeStampView.X, this.rareTimeStampView.Y);
        cxt.closePath();
        cxt.stroke();
    }

    this.hitTest = function (mouseLocation, radius) {
        return lineHitTest(mouseLocation, radius, {
            startX: this.foreTimeStampView.X,
            startY: this.foreTimeStampView.Y,
            endX: this.rareTimeStampView.X,
            endY: this.rareTimeStampView.Y
        });
    }
}


// The over block section of train paths.

function OverBlockLine(trainView, foreTimeStampView, rareTimeStampView) {
    this.trainView = trainView;
    this.foreTimeStampView = foreTimeStampView;
    this.rareTimeStampView = rareTimeStampView;

    this.draw = function (cxt) {
        cxt.beginPath();

        cxt.lineWidth = frame.style.overBlockLineStyle.width;
        cxt.strokeStyle = frame.style.overBlockLineStyle.color;
        cxt.beginPath();
        cxt.moveTo(this.foreTimeStampView.X, this.foreTimeStampView.Y);
        cxt.lineTo(this.rareTimeStampView.X, this.rareTimeStampView.Y);
        cxt.closePath();
        cxt.stroke();

        cxt.lineWidth = frame.style.trainViewStyle.width[this.trainView.status][this.trainView.trainObj.type];
        cxt.strokeStyle = frame.style.trainViewStyle.color[this.trainView.trainObj.type];
    }

    this.hitTest = function (mouseLocation, radius) {
        return lineHitTest(mouseLocation, radius, {
            startX: this.foreTimeStampView.X,
            startY: this.foreTimeStampView.Y,
            endX: this.rareTimeStampView.X,
            endY: this.rareTimeStampView.Y
        });
    }
}

