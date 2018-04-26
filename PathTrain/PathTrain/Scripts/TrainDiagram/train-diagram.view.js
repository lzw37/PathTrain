// Define the display style of the whole diagram

function DisplayStyle() {
    this.styleName = 'Default';

    this.stationViewStyle = {
        'normal': {
            'color': '#009900',
            'width': '1',
        }
    }
}


// The frame of the whole diagram

function Frame(size) {
    this.size = size;  // The size of the canvas client rectangle.

    this.blockList = [];  // The block list.

    this.style = new DisplayStyle();

    this.margin = {  // Margin parameters of the panorama view.
        left: 30,
        right: 30,
        top: 30,
        bottom: 30,
    };

    this.totalTimeInMinute = 1440;  // The total length of the time horizon (in minutes).

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
        horizontial: 1,  // pixel per minute
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
        return frame.orgPosition.X + frame.totalTimeInMinute * frame.zoomRatio.horizontial;
    }

    // update parameters of the current block and its children elements.
    this.update = function (currentY) {
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
    this.time = '00:00:00';
    this.X = 0;
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
        this.Y = blockTop + frame.zoomRatio.vertical * this.milesInBlock;
    }

    // Draw the current station view.
    this.draw = function (cxt) {
        var currentStationViewStyle = frame.style.stationViewStyle['normal'];
        cxt.lineWidth = currentStationViewStyle['width'];
        cxt.strokeStyle = currentStationViewStyle['color'];
        cxt.moveTo(this.left(), this.Y);
        cxt.lineTo(this.right(), this.Y);
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

    // test messages.
    d.innerHTML = "Finished!";
}


// Update the whole train diagram.

function updateView() {
    var currentY = frame.innerRectangle.top();

    for (var k in frame.blockList) {
        var block = frame.blockList[k];
        block.update(currentY);
        currentY = block.bottom + block.margin;
    }

}


