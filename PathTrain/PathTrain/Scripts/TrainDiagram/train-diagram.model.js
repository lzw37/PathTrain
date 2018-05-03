// Global data collections

var model = {
    line_map: {},
    station_map: {},
    segment_map: {},
    train_map: {},
}


// Line: Railway lines, which are generally represented by blocks in the train diagram. 

function Line(id, name) {
    this.id = id;
    this.name = name;
    this.stationList = [];
}


// Station: Railway stations, which are represented by horizontial lines in the train diagram.

function Station(id, name, line_id, sequence, miles) {
    this.id = id;
    this.name = name;
    this.line_id = line_id;
    this.sequenct = sequence;
    this.miles = miles;
}


// Segment: Railway open track segments, which indicate a railway section between two consecutive stations.

function Segment(from_station_id, to_station_id) {
    this.from_station_id = from_station_id;
    this.to_station_id = to_station_id;
}


// Train: Train paths, which are represented by time-space paths on the diagram.

function Train(id, type, originalStation, destinationStation) {
    this.id = id;
    this.type = type;
    this.lineList = [];  // a sequence of railway lines in the route of the train
    this.timeTable = [];  // a sequence of objects of time stamp
    this.originalStation = originalStation;
    this.destinationStation = destinationStation;
}


// TimeStamp: an object of the train operation time stamp.

function TimeStamp(train, station, time, operation) {
    this.station = station;
    this.train = train;
    this.time = time;
    this.operation = operation;
}