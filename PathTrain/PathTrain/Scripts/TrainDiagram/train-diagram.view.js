function DisplayStyle() {

}


function Frame() {

}

function StationView() {

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
