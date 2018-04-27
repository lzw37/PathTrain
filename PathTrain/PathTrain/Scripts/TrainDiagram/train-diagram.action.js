function mouseMove(e) {
    // location display
    var div = document.getElementById('coordinate');
    var x = e.offsetX;
    var y = e.offsetY;
    div.innerText = 'Current mouse location:(' + x + ',' + y + ').';

    var isDiagramChanged = false;
    // hit test
    var stationHitTestResult = stationViewHitTest({ 'X': x, 'Y': y });

    // redraw the diagram
    if (stationHitTestResult.isStatusChanged)
        display(cxt);  // hit test is not necessary to update position information.
}


// Global station view hit test.

function stationViewHitTest(mouseLocation) {

    var infoDiv = document.getElementById('info');

    var isStatusChanged = false;  // To decide if the diagram should be redraw.
    var hitStationView = null;

    for (var k in frame.blockList) {
        for (var s in frame.blockList[k].stationViewList) {
            var stationView = frame.blockList[k].stationViewList[s];
            if (stationView.hitTest(mouseLocation, 3) == true) {  // hit test is sucessful.
                infoDiv.innerText = 'Station view:' + stationView.stationObj.name;
                stationView.status = 'hit';
                hitStationView = stationView;
                isStatusChanged = true;
            }
            else {  // hit test failed.
                if (stationView.status == 'hit') {
                    stationView.status = 'normal';
                    isStatusChanged = true;
                }
            }
        }
    }
    if (hitStationView == null)
        infoDiv.innerText = '';
    return { 'isStatusChanged': isStatusChanged, 'hitStationView': hitStationView };
}