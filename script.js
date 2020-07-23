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

function success(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&APPID=f4d4de4a53ae884dfc78b96e481c919f";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        currentLoc = response.name;
        saveLoc(response.name);
        getCurrent(currentLoc);
    });

}

function error(){
    //If locating fails, automatically give them Atlanta
    currentLoc = "Atlanta"
    getCurrent(currentLoc);
}

function showPrevious() {
    //Use local storage to display old searches
    if (previousLoc) {
        $("#prevSearches").empty();
        var btns = $("<div>").attr("class", "list-group");
        for (var i = 0; i < previousLoc.length; i++) {
            var locBtn = $("<a>").attr("href", "#").attr("id", "loc-btn").text(previousLoc[i]);
            if (previousLoc[i] == currentLoc){
                locBtn.attr("class", "list-group-item list-group-item-action active");
            }
            else {
                locBtn.attr("class", "list-group-item list-group-item-action");
            }
            btns.prepend(locBtn);
        }
        $("#prevSearches").append(btns);
    }
}
