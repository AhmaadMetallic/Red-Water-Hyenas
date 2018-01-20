$( document ).ready(function() {

    //start firebase
    var config = {
        apiKey: "AIzaSyB8PyxH26WGIUtkUPRj_6YUGF1Dr2e9BTU",
        authDomain: "red-water-hyenas.firebaseapp.com",
        databaseURL: "https://red-water-hyenas.firebaseio.com",
        projectId: "red-water-hyenas",
        storageBucket: "red-water-hyenas.appspot.com",
        messagingSenderId: "912121318083"
      };
    firebase.initializeApp(config);
    var database = firebase.database();




    //USER INPUT HERE --------------------------------
    function startSearch(event){
        event.preventDefault();
        var input= $('input').val().trim();
        if(is_usZipCode(input)){
            localStorage.setItem('zipCode', input );
        }else if(is_cityState(input)){
            var city = input.split(',')[0]
            var state = (input.split(',')[1][0] === ' ') ? input.split(',')[1].slice(1,3) : input.split(',')[1];
            localStorage.setItem('city', city);
            localStorage.setItem('state', state);
            cityToZLL()
        }else{
            console.log('Invalid input!')
        }
        //get latitude/longitude info from zipcode
        // location.href = 'threatlevel.html' /Do this after APIs calls have 
    }
    
    //-------------------------------------------------

    function is_usZipCode(str){
        regexpZip = /^[0-9]{5}(?:-[0-9]{4})?$/;
        if (regexpZip.test(str)){
            return true;
        }else{
            return false;
        }
    }

    function is_cityState(str){
        regexpCityState = /([^,]+),\s*(\w{2})/;
        if (regexpCityState.test(str)){
            return true;
        }else{
            return false;
        }
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
                "srchOpt": 'fs',
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
            // headers: {
            //     "Access-Control-Allow-Origin": "*",
            // },
            // processData: false,
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
            //lat/long
            var info = response.results[0].geometry.location
            var lat = info.lat,
                long = info.lng;

            localStorage.setItem('lat', lat.toString());
            localStorage.setItem('long', long.toString());

            //city/state
            response.results[0].address_components.forEach(updateCityStateZip)

        })
    }

    function latLongToZip(){
        var lat = localStorage.getItem('lat');
        var long = localStorage.getItem('long');
        var latlng = lat + ',' + long;
        var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latlng + '&key=AIzaSyA6IzOwL3Sg_yNo0COz67cN8b8Xt330qdE'

        $.get(url).done(function(response){
            console.log(response)

            response.results[0].address_components.forEach(updateCityStateZip)
            
            
        })

    }

    function updateCityStateZip(obj){
        //find city
        if(obj.types[0] === 'locality'){
            localStorage.setItem('city', obj.short_name)
        }
        //find state
        else if(obj.types[0] === "administrative_area_level_1"){
            localStorage.setItem('state', obj.short_name)
        }
        //find zip code
        else if(obj.types[0] === 'postal_code'){
            localStorage.setItem('zipCode', obj.short_name)
        }
    }

    //user can input city and state
    function cityToZLL(){
        var city = localStorage.getItem('city');
        var state = localStorage.getItem('state');
        var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + city + ','+ state + '&key=AIzaSyA6IzOwL3Sg_yNo0COz67cN8b8Xt330qdE'

        $.get(url).done(function(response){
            console.log(response);
            localStorage.setItem('lat', response.results[0].geometry.location.lat)
            localStorage.setItem('long', response.results[0].geometry.location.lng)
            latLongToZip();
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
        
        $.get(herokuUrl).done(findTweetsInRadius)
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

    function pushToFirebase () {
        var cityName = localStorage.getItem('city')
        database.ref().orderByChild('city').equalTo(cityName).once("value", function(snapshot) {
            console.log(snapshot.val());

            if(snapshot.val()){
                
                snapshot.forEach(function(data) {
                    console.log('Data Key: ' + data.key);
                    var exists = data.key
                    var count = snapshot.val()[exists].count
                    console.log(count)
                    count ++
                    console.log(count)
                    //add 1 to the count if its been searched again
                    
                        console.log('It already exists!')
                        database.ref(exists).update({
                            count: count++
                        })
                    })
            }else{
                console.log('Creating new entry')
                database.ref().push({
                    city: localStorage.getItem('city'),
                    state: localStorage.getItem('state'),
                    zipCode: localStorage.getItem('zipCode'),
                    lat: localStorage.getItem('lat'),
                    long: localStorage.getItem('long'),
                    count: 1,
                }) 
            }
        })
    }

    function mostSearchedCities () {
        database.ref().orderByChild('count').once('value', function(snapshot){
            console.log(snapshot.val())
        })
    }
    
    
    
    
    $('#searchBtn').click(startSearch)
})