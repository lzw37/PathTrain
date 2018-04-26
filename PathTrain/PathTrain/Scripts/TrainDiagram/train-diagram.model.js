// Global data collections

var model = {
    station_map: {},
    segment_map: {},
}


// Line: Railway lines, which are generally represented by blocks in the train diagram. 

function Line(id, name) {
    this.id = id;
    this.name = name;
}


// Station: Railway stations, which are represented by horizontial lines in the train diagram.

function Station(id, name, lineId, sequence, miles) {
    this.id = id;
    this.name = name;
    this.lineId = lineId;
    this.sequenct = sequence;
    this.miles = miles;
}


// Segment: Railway open track segments, which indicate a railway section between two consecutive stations.

function Segment(from_station_id, to_station_id) {
    this.from_station_id = from_station_id;
    this.to_station_id = to_station_id;
}


// Train: Train paths, which are represented by time-space paths on the diagram.

function Train(id) {
    this.id = id;
}