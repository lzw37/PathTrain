// Define the display style of the whole diagram

function DisplayStyle() {
    this.styleName = 'Default';

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
            'G': {
                'color': '#009900'
            },
            'D': {

            },
            'F': {

            }
        },
        width: {

        },
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
        horizontial: 0.016,  // pixel per second
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
    this.margin = 80;  // Margin size for this block in the top and the bottom.
    this.top = 0;
    this.bottom = 0;
    this.left = function () {
        return frame.orgPosition.X;
    }
    this.right = function () {
        return frame.orgPosition.X + frame.totalTimeInSecond * frame.zoomRatio.horizontial;
    }

    // update parameters of the current block and its children elements.
    this.update = function (currentY) {
        this.top = currentY;
        for (var s in this.stationViewList) {
            this.stationViewList[s].update(currentY);
        }
        this.bottom = this.stationViewList[this.stationViewList.length - 1].Y;
    }

    // draw the block and its elements.
    this.draw = function (cxt) {
        for (var s in this.stationViewList) {
            this.stationViewList[s].draw(cxt);
        }
    }
}


// TimeLine: a view object of the time line in the diagram

function TimeLine() {
    this.time = 0;  // in second
    this.X = 0;
    this.lineSection = []; // {startY:value, endY:value}, depending on the position (top and bottom) of each block
    this.lineType = 'default';

    // Update the position of the time line.
    this.update = function (time) {
        this.time = time;
        this.X = frame.secondToPixel(time);

        // Define the line section by blocks.
        for (var k in frame.blockMap) {
            var block = frame.blockMap[k];
            var lineSection = {
                startY: block.top,
                endY: block.bottom,
            }
            this.lineSection.push(lineSection);
        }

        // Define the line type by the time.
        if (time % 3600 == 0) {
            this.lineType = 'hour';
        }
        else if (time % 1800 == 0) {
            this.lineType = '_30min';
        }
        else if (time % 600 == 0) {
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
            cxt.setLineDash([0]);
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

function StationView(id, stationObjId, lineObjId, blockId, sequence) {
    this.id = id;
    // Structure attributes
    this.stationObj = model.station_map[stationObjId];
    this.lineObj = model.line_map[lineObjId];
    this.block = frame.blockMap[blockId];
    this.sequence = sequence;
    this.milesInBlock = this.stationObj.miles;

    // Status attribute
    this.status = 'normal';

    // Position attributes
    this.Y = 0;
    this.left = function () {
        return this.block.left();
    }
    this.right = function () {
        return this.block.right();
    }

    // Update the current station view.
    this.update = function (blockTop) {
        this.Y = Math.round(blockTop + frame.zoomRatio.vertical * this.milesInBlock) + 0.5;
    }

    // Draw the current station view.
    this.draw = function (cxt) {
        var currentStationViewStyle = frame.style.stationViewStyle[this.status];
        cxt.beginPath();
        cxt.lineWidth = currentStationViewStyle['width'];
        cxt.strokeStyle = currentStationViewStyle['color'];
        cxt.moveTo(this.left(), this.Y);
        cxt.lineTo(this.right(), this.Y);
        cxt.closePath();
        cxt.stroke();
    }

    // Hit test of the station view.
    this.hitTest = function (mouseLocation, radius) {
        if (mouseLocation.Y < this.Y - radius || mouseLocation.Y > this.Y + radius)
            return false;
        if (mouseLocation.X < this.left() - radius || mouseLocation.X > this.right() + radius)
            return false;
        return true;
    }
}


// TrainView: a view object of a train path

function TrainView(id, trainObj) {
    this.trainObj = trainObj;
    this.stationViewList = [];  // in the drawing sequence
    this.timeStampViewList = []; // in the drawing sequence
    this.pathList = [];  // in the drawing sequence. 

    this.generate = function () {
        // generate the relative timeStampViewList by the trainObj.timeStampList
        for (var stampIdx in trainObj.timeTable) {
            var sta = model.station_map[trainObj.timeTable[stampIdx].station];
            var staViewList = frame.stationViewMap[sta.id];

            if (staViewList.length == 1) {
                // only one station view is found.
                var staView = staViewList[0];
                this.stationViewList.push(staView);

                var timeStampView = new TimeStampView(this, staView, trainObj.timeTable[stampIdx]);
                this.timeStampViewList.push(timeStampView);
            }
            else {
                // more than one station views are found.
                for (var lId in this.trainObj.lineList) {
                    var l = model.line_map[lId];
                    for (var svId in staViewList) {
                        // select the display StationView by the line list.
                        var staView = staViewList[svId];
                        if(l == staView.lineObj){
                            this.stationViewList.push(staView);

                            var timeStampView = new TimeStampView(this, staView, trainObj.timeTable[stampIdx]);
                            this.timeStampViewList.push(timeStampView);
                        }
                    }
                }
            }
        }

        // generate path list.
        // ... 
    }

    this.hitTest = function () {

    }

    this.update = function () {
        for (var tsvIdx in this.timeStampViewList) {
            var tsv = this.timeStampViewList[tsvIdx];
            tsv.update();
        }
    }

    this.draw = function () {
        // draw a sectional path by the time stamps.
        for (var l in this.pathList){
            this.pathList[l].draw();
        }
    }
}


// TimeStampView: a view object of the time label of train operations (arrival or departure)

function TimeStampView(trainView, stationView, timeStamp) {
    this.stationView = stationView
    this.trainView = trainView;
    this.timeStamp = timeStamp;

    this.X = 0;
    this.Y = 0;

    this.hitTest = function () {

    }

    this.update = function () {
        // ensure the consistancy of the positions for TimeStampView and StationView
        this.X = frame.secondToPixel(this.timeStamp.time);
        this.Y = this.stationView.Y;
    }

    this.draw = function () {

    }
}


// The running line sections of train paths.

function RunningLine(trainView, foreTimeStampView, rareTimeStampView) {
    this.trainView = trainView;
    this.foreTimeStampView = foreTimeStampView;
    this.rareTimeStampView = rareTimeStampView;

    function draw() {

    }

}


// The dwelling line sections of train paths.

function DwellingLine() {
    this.trainView = trainView;
    this.foreTimeStampView = foreTimeStampView;
    this.rareTimeStampView = rareTimeStampView;

    function draw() {

    }
}


// The main function for reflash the diagram

function display(cxt) {
    // Fill the background
    cxt.fillStyle = "#e5f7ff";
    c.clientWidth
    cxt.fillRect(0, 0, c.clientWidth, c.clientHeight);

    // draw diagram.
    for (var k in frame.blockMap) {
        frame.blockMap[k].draw(cxt);
    }

    for (var tl in frame.timeLineList) {
        frame.timeLineList[tl].draw(cxt);
    }
}


// Update the whole train diagram.

function updateView() {

    // Update the position of blocks and station views.

    var currentY = frame.orgPosition.Y;

    for (var k in frame.blockMap) {
        var block = frame.blockMap[k];
        block.update(currentY);
        currentY = block.bottom + block.margin;
    }

    // Update the time lines.
    for (var t = 0; t < frame.totalTimeInSecond;
        t += frame.style.timeLineStepSize[frame.displaySettings.timeLineMode]) {
        var tl = new TimeLine();
        tl.update(t);
        frame.timeLineList.push(tl);
    }

    // Update train views.
    for (var trvIdx in frame.trainViewMap) {
        var trView = frame.trainViewMap[trvIdx];
        trView.update();
    }
}


