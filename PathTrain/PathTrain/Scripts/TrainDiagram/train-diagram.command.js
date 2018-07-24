var doneCommandList = [];
var redoCommandList = [];

function revoke() {
    if (doneCommandList.length != 0)
        doneCommandList[doneCommandList.length - 1].revoke();
}

function redo() {
    if (redoCommandList.length != 0)
        redoCommandList[redoCommandList.length - 1].redo();
}


// The command prototype.

function Command() {
    this.proto_do = function () {
        frame.updateView();
        frame.display(cxt);
        doneCommandList.push(this);
    }

    this.proto_revoke = function () {
        frame.updateView();
        frame.display(cxt);
        doneCommandList.splice(doneCommandList.indexOf(this), 1);
        redoCommandList.push(this);
    }
    this.proto_redo = function () {
        this.do();
        frame.updateView();
        frame.display(cxt);
        redoCommandList.splice(redoCommandList.indexOf(this), 1);
    }
}


// Add train command

function AddCommand(trainObj) {

    this.trainObj = trainObj;

    this.do = function () {
        if (model.train_map[trainObj.id] != null){
            window.alert("The train " + trainObj.id + "is already exist.");
            return;
        }
        model.train_map[trainObj.id] = trainObj;
        var trainView = new TrainView(trainObj.id, trainObj);
        frame.trainViewMap[trainObj.id] = trainView;
        trainView.generate();
        this.proto_do();
    }

    this.revoke = function () {
        delete model.train_map[trainObj.id];
        delete frame.trainViewMap[trainObj.id];
        this.proto_revoke();
    }

    this.redo = function () {
        this.proto_redo();
    }
}

AddCommand.prototype = new Command();


// Delete train command

function DeleteCommand(trainObj) {

    this.trainObj = trainObj;

    this.do = function () {
        delete model.train_map[trainObj.id];
        delete frame.trainViewMap[trainObj.id];
        this.proto_do();
    }

    this.revoke = function () {
        model.train_map[trainObj.id] = trainObj;
        var trainView = new TrainView(trainObj.id, trainObj);
        frame.trainViewMap[trainObj.id] = trainView;
        trainView.generate();
        this.proto_revoke();
    }

    this.redo = function () {
        this.proto_redo();
    }
}

DeleteCommand.prototype = new Command();


// Edit time stamp command

function EditCommand(trainObj, orgTimetable) {

    this.trainObj = trainObj;
    var orgTimetableStr = JSON.stringify(orgTimetable);
    this.orgTimetable = JSON.parse(orgTimetableStr);
    this.newTimetable = null;

    this.do = function () {
        this.newTimetable = JSON.parse(JSON.stringify(this.trainObj.timeTable));
        this.proto_do();
    }

    this.revoke = function () {
        this.trainObj.timeTable = JSON.parse(JSON.stringify(this.orgTimetable));
        frame.trainViewMap[this.trainObj.id].generate();
        this.proto_revoke();
    }

    this.redo = function () {
        this.trainObj.timeTable = JSON.parse(JSON.stringify(this.newTimetable));
        frame.trainViewMap[this.trainObj.id].generate();
        frame.updateView();
        frame.display(cxt);
        doneCommandList.push(this);
        redoCommandList.splice(redoCommandList.indexOf(this), 1);
    }
}

EditCommand.prototype = new Command();


