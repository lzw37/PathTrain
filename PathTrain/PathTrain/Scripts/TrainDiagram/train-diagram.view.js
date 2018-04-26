// Define the display style of the whole diagram

function DisplayStyle() {

}


// The frame of the whole diagram

function Frame() {

}

function Block() {
    this.margin = 10;  // Margin size for this block in the top and the bottom.
    this.station_view_list = [];

    this.draw = function(){

    }

}


// StationView: a view object of the station line in the diagram

function StationView(stationObj) {
    this.stationObj = stationObj;
    this.block = null;
    this.sequence = null;
    this.Y_Position = null;

}


// The main function for reflash the diagram

function display() {

    // test messages.

    var d = document.getElementById('info');
    var str = '';
    for (var k in model.station_map) {
        str += model.station_map[k].name + '\<br />';
    }
    d.innerHTML = str;
}
