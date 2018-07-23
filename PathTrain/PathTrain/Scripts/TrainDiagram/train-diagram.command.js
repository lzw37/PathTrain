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

function EditCommand() {

    this.do = function () {

    }

    this.revoke = function () {

    }
}

EditCommand.prototype = new Command();


