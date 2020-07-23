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
        $("#lastSearch").empty();
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
        $("#lastSearch").append(btns);
    }
}

function getCurrent(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=f4d4de4a53ae884dfc78b96e481c919f&units=imperial";
    $.ajax({
        url: queryURL,
        method: "GET",
        error: function (){
            previousLoc.splice(previousLoc.indexOf(city), 1);
            localStorage.setItem("weathercities", JSON.stringify(previousLoc));
            initialize();
        }
    }).then(function (response) {
        //create card
        var currCard = $("<div>").attr("class", "card bg-light");
        $("#weatherOutlook").append(currCard);

        //give card the location
        var currCardHead = $("<div>").attr("class", "card-header").text("Current weather for " + response.name);
        currCard.append(currCardHead);

        var cardRow = $("<div>").attr("class", "row no-gutters");
        currCard.append(cardRow);

        //grab icon that goes with the weather
        var iconURL = "https://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png";

        var imgDiv = $("<div>").attr("class", "col-md-4").append($("<img>").attr("src", iconURL).attr("class", "card-img"));
        cardRow.append(imgDiv);

        var textDiv = $("<div>").attr("class", "col-md-8");
        var cardBody = $("<div>").attr("class", "card-body");
        textDiv.append(cardBody);
        //Shows city name
        cardBody.append($("<h3>").attr("class", "card-title").text(response.name));
        //Shows when it was last updated
        var currdate = moment(response.dt, "X").format("dddd, MMMM Do YYYY, h:mm a");
        cardBody.append($("<p>").attr("class", "card-text").append($("<small>").attr("class", "text-muted").text("Last updated: " + currdate)));
        //Show Temp
        cardBody.append($("<p>").attr("class", "card-text").html("Temperature: " + response.main.temp + " &#8457;"));
        //Show Humidity
        cardBody.append($("<p>").attr("class", "card-text").text("Humidity: " + response.main.humidity + "%"));
        //Show Wind Speed
        cardBody.append($("<p>").attr("class", "card-text").text("Wind Speed: " + response.wind.speed + " MPH"));
    });
}
