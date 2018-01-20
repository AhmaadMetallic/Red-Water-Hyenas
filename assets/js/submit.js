$( document ).ready(function() {

    function startSearch(event){
        //eventually have if/else statement depending on success of geolocation
        event.preventDefault();
        var zipCode = $('input').val().trim();
        console.log(zipCode)
        localStorage.setItem('zipCode', zipCode );
        //get latitude/longitude info from zipcode
        zipToLatLong()
        // location.href = 'threatlevel.html' /Do this after APIs calls have 
    }
    
    
    function walgreensAPI(){
        var lat = localStorage.getItem('lat');
        var long = localStorage.getItem('long');
        var url = 'https://services-qa.walgreens.com/api/stores/search'
        var herokuUrl = "https://cors-anywhere.herokuapp.com/" + url

        var WGobj = 
            {
                "apiKey": "4n8VgBaIAcwfqcxWAQSreiniwZAGXltd",
                "affId": "storesapi",
                "lat": lat,
                "lng": long,
                "srchOpt": '',
                "nxtPrev": '',
                "requestType": "locator",
                "act": "fndStore",
                "view": "fndStoreJSON",
                "devinf": '',
                "appver": '',
            }

        $.ajax({
            type: "POST",
            url: herokuUrl,
            headers: {
                "Access-Control-Allow-Origin": "x-requested-with",
            },
            processData: false,
            contentType: 'application/json',
            data: JSON.stringify(WGobj),
        }).done(function(response){
            console.log(response)
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.log('ERROR', errorThrown)
        })
    }
    
    function zipToLatLong(){
        var zipCode = localStorage.getItem('zipCode')
        var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + zipCode + '&key=AIzaSyA6IzOwL3Sg_yNo0COz67cN8b8Xt330qdE'
        $.get(url).done(function(response){
            console.log(response);
            var info = response.results[0].geometry.location
            var lat = info.lat,
                long = info.lng;
            console.log(lat, long);
            localStorage.setItem('lat', lat.toString());
            localStorage.setItem('long', long.toString());
        })
    }

    function censusData(){
        var zipCode = localStorage.getItem('zipCode');
        var url = 'https://api.census.gov/data/2016/acs/acs5/subject?get=NAME,S0101_C01_001E&for=zip%20code%20tabulation%20area:' + zipCode + '&key=ac21ba4cee033cdd33b527b24debd43baf85c8dd'
        $.get(url).done(function(response){
            console.log(response)
        })

        //note: The SSL certificate used to load resources from https://api.census.gov will be distrusted in M70. Once distrusted, users will be prevented from loading these resources. See https://g.co/chrome/symantecpkicerts for more information. (Around April 2018)
    }

    function getFluTweets () {
        var url = 'http://api.flutrack.org/?time=7'
        var herokuUrl = 'https://cors-anywhere.herokuapp.com/' + url
        $.get(herokuUrl).done(findTweetsInRadius
        )
    }

    function findTweetsInRadius (response) {

        var userLat = localStorage.getItem('lat');
        var userLong = localStorage.getItem('long');
        var radiusMi = 15
        var radiusDeg = radiusMi/69.172
        var latDist
        var longDist

        var nearbyTweets = response.filter(function(tweet, ind){

            latDist = Number(tweet.latitude) - Number(userLat)
           
            longDist = Number(tweet.longitude) - Number(userLong)
            
            distDeg  = Math.sqrt(latDist*latDist + longDist*longDist)
            

            return distDeg < radiusDeg;
            
            
        })

        console.log(nearbyTweets);
    }
    
    
    
    
    $('#searchBtn').click(startSearch)
})