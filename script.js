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
        $("#lastSearches").empty();
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
        $("#lastSearches").append(btns);
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
        var iconURL = "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png";

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

//UV Index
var uvURL = "https://api.openweathermap.org/data/2.5/uvi?appid=f4d4de4a53ae884dfc78b96e481c919f&lat=" + response.coord.lat + "&lon=" + response.coord.lat;
$.ajax({
    url: uvURL,
    method: "GET"
}).then(function (uvresponse) {
    var uvindex = uvresponse.value;
    var bgcolor;
    if (uvindex <= 3) {
        bgcolor = "green";
    }
    else if (uvindex >= 3 || uvindex <= 6) {
        bgcolor = "yellow";
    }
    else if (uvindex >= 6 || uvindex <= 8) {
        bgcolor = "orange";
    }
    else {
        bgcolor = "red";
    }
    var uvdisp = $("<p>").attr("class", "card-text").text("UV Index: ");
    uvdisp.append($("<span>").attr("class", "uvindex").attr("style", ("background-color:" + bgcolor)).text(uvindex));
    cardBody.append(uvdisp);

});

cardRow.append(textDiv);
getForecast(response.id);

});
}

// Grab the forecast
function getForecast(city) {
    //Integrate the 5 day forecast
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + city + "&APPID=f4d4de4a53ae884dfc78b96e481c919f&units=imperial";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        //Integrate new container to hold the forecast
        var newrow = $("<div>").attr("class", "forecast");
        $("#weatherOutlook").append(newrow);

        //Now we have to loop back through the array
        for (var i = 0; i < response.list.length; i++) {
            if (response.list[i].dt_txt.indexOf("15:00:00") !== -1) {
                var newCol = $("<div>").attr("class", "one-fifth");
                newrow.append(newCol);

                var newCard = $("<div>").attr("class", "card text-white bg-primary");
                newCol.append(newCard);

                var cardHead = $("<div>").attr("class", "card-header").text(moment(response.list[i].dt, "X").format("MMM Do"));
                newCard.append(cardHead);

                var cardImg = $("<img>").attr("class", "card-img-top").attr("src", "https://openweathermap.org/img/w/" + response.list[i].weather[0].icon + ".png");
                newCard.append(cardImg);

                var bodyDiv = $("<div>").attr("class", "card-body");
                newCard.append(bodyDiv);

                bodyDiv.append($("<p>").attr("class", "card-text").html("Temp: " + response.list[i].main.temp + " &#8457;"));
                bodyDiv.append($("<p>").attr("class", "card-text").text("Humidity: " + response.list[i].main.humidity + "%"));
            }
        }
    });
}


function clear() {
    //clear weather
    $("#weatherOutlook").empty();
}

function saveLoc(loc){
    //puts previous cities into our saved array
    if (previousLoc === null) {
        previousLoc = [loc];
    }
    else if (previousLoc.indexOf(loc) === -1) {
        previousLoc.push(loc);
    }
    //new array gets saved via Local Storage
    localStorage.setItem("weathercities", JSON.stringify(previousLoc));
    showPrevious();
}

$("#searchbtn").on("click", function () {
    event.preventDefault();
    var loc = $("#searchinput").val().trim();
    if (loc !== "") {
        clear();
        currentLoc = loc;
        saveLoc(loc);
        $("#searchinput").val("");
        getCurrent(loc);
    }
});

$(document).on("click", "#loc-btn", function () {
    clear();
    currentLoc = $(this).text();
    showPrevious();
    getCurrent(currentLoc);
});

initialize();

