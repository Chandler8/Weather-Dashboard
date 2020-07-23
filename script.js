var previousLoc = [];
var currentLoc;

function initialize() {
    //uses old locations from local storage
    previousLoc = JSON.parse(localStorage.getItem("weathercities"));
    var lastSearch;
    //shows buttons from old searches
    if (previousLoc) {
        //grabs the most recently searched city 
        currentLoc = previousLoc[previousLoc.length - 1];
        showPrevious();
        getCurrent(currentLoc);
    }
    else {
        //try to locate, otherwise set default as Atlanta
        if (!navigator.geolocation) {
            //no input = Atlanta
            getCurrent("Atlanta");
        }
        else {
            navigator.geolocation.getCurrentPosition(success, error);
        }
    }

}
