var doneCommandList = [];
var redoCommandList = [];

function revoke() {
    var cmd = doneCommandList[doneCommandList.length - 1];
    cmd.revoke();
}

function redo() {
    var cmd = redoCommandList[redoCommandList.length - 1];
    cmd.redo();
}


// The command prototype.

function Command() {
    this.proto_do = function () {
        updateView();
        display();
        doneCommandList.push(this);
    }

    this.proto_revoke = function () {
        updateView();
        display();
        doneCommandList.remove(this);
        redoCommandList.push(this);
    }
    this.redo = function () {
        this.do();
        updateView();
        display();
        doneCommandList.push(this);
        redoCommandList.remove(this);
    }
}


// Add train command

function AddCommand(trainObj) {

    this.trainObj = trainObj;

    this.do = function () {
        model.train_map[trainObj.id] = trainObj;
        var trainView = new TrainView(trainObj.id, trainObj);
        frame.trainViewMap[trainObj.id] = trainView;
        trainView.generate();
        this.proto_do();
    }

    this.revoke = function () {
        delete model.train_map[trainObj.id];
        delete frame.trainViewMap[trainObj.id];
        this.proto_revoke;
    }
}

AddCommand.prototype = new Command();


// Delete train command

function DeleteCommand(trainObj) {

    this.trainObj = trainObj;

    this.do = function () {
        delete model.train_map[trainObj.id];
        delete frame.trainViewMap[trainObj.id];
        this.proto_revoke;
    }

    this.revoke = function () {
        model.train_map[trainObj.id] = trainObj;
        var trainView = new TrainView(trainObj.id, trainObj);
        frame.trainViewMap[trainObj.id] = trainView;
        trainView.generate();
        this.proto_do();
    }
}

DeleteCommand.prototype = new Command();


// Edit time stamp command

function EditCommand() {

    this.do = function () {

    }

    this.revoke = function () {

    }
}

EditCommand.prototype = new Command();


