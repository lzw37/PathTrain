// Define the display style of the whole diagram

function DisplayStyle() {
    this.styleName = 'Default';

    this.stationViewStyle = {
        'normal': {
            'color': '#009900',
            'width': '2',
        }
    }

    this.timeLineStepSize = {
        '_10min': 600,
        '_60min': 3600,
    }

    this.timeLineStyle = {
        'default':{
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
}


// The frame of the whole diagram

function Frame(size) {
    this.size = size;  // The size of the canvas client rectangle.

    this.blockList = [];  // The block list.
    this.timeLineList = [];

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
        left : function(){
            return currentFrame.margin.left;
        },
        right : function () {
            return currentFrame.size.width - currentFrame.margin.left - currentFrame.margin.right;
        },
        top : function(){
            return currentFrame.margin.top
        },
        bottom : function () {
            return currentFrame.size.height - currentFrame.margin.top - currentFrame.margin.bottom
        }
    }

    // The coordinates of the original point.
    this.orgPosition = {
        X: 20,
        Y: 20,
    }

    // Transfer parameters between pixels and specific values.
    this.zoomRatio = {
        horizontial: 0.018,  // pixel per second
        vertical: 1.8, // pixel per miles
    } 
}


// Block: a view object of a independent train diagram block

function Block() {
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

    this.update = function (time) {
        this.time = time;
        this.X = Math.round(frame.orgPosition.X + time * frame.zoomRatio.horizontial) + 0.5;
        for (var k in frame.blockList) {
            var block = frame.blockList[k];
            var lineSection = {
                startY: block.top,
                endY: block.bottom,
            }
            this.lineSection.push(lineSection);
        }

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

    this.draw = function(cxt){
        var currentStationViewStyle = frame.style.timeLineStyle[this.lineType];
        cxt.lineWidth = currentStationViewStyle['width'];
        cxt.strokeStyle = currentStationViewStyle['color'];
        if (this.lineType == '_30min') {
            cxt.setLineDash([10]);
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

function StationView(stationObj, block, sequence) {
    // Structure attributes
    this.stationObj = stationObj;
    this.block = block;
    this.sequence = sequence;
    this.milesInBlock = stationObj.miles;

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
        var currentStationViewStyle = frame.style.stationViewStyle['normal'];
        cxt.beginPath();
        cxt.lineWidth = currentStationViewStyle['width'];
        cxt.strokeStyle = currentStationViewStyle['color'];
        cxt.moveTo(this.left(), this.Y);
        cxt.lineTo(this.right(), this.Y);
        cxt.closePath();
        cxt.stroke();
    }
}


// The main function for reflash the diagram

function display(cxt) {

    // test messages.
    var d = document.getElementById('info');
    var str = '';
    for (var k in model.station_map) {
        str += model.station_map[k].name + '\<br />';
    }
    d.innerHTML = str;

    // draw diagram.
    for (var k in frame.blockList) {
        frame.blockList[k].draw(cxt);
    }

    for (var tl in frame.timeLineList) {
        frame.timeLineList[tl].draw(cxt);
    }

    // test messages.
    d.innerHTML = "Finished!";
}


// Update the whole train diagram.

function updateView() {

    // Update the position of blocks and station views.

    var currentY = frame.orgPosition.Y;

    for (var k in frame.blockList) {
        var block = frame.blockList[k];
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
}


