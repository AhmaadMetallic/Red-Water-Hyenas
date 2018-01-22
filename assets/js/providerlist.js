$( document ).ready(function() {

    //APIs haven't run
    if(!localStorage.getItem('walgreens')){
        walgreensAPI();
        medicareInfo();
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
            localStorage.setItem('walgreens', JSON.stringify(response));
            console.log(JSON.parse(localStorage.getItem('walgreens')))

        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.log('ERROR', errorThrown)
        })
    }

    function medicareInfo (){
        var city = localStorage.getItem('city').toUpperCase()
        var state = localStorage.getItem('state').toUpperCase()
        var url = 'https://data.cms.gov/resource/q3yr-x26f.json?city=' + city + '&state_code=' + state + '&provider_type=Internal%20Medicine'

        $.get(url).done(function(response){
            console.log(response);
            var docAddresses = []
            //only return 10 addresses
            var docArray = response.filter(function(doctor, ind){
                if(docAddresses.length === 0){
                    console.log(doctor)
                    docAddresses.push(doctor["street_address_1"])
                    return doctor
                }else if(docAddresses.length < 10){
                    //the address is new
                    if(docAddresses.indexOf(doctor["street_address_1"]) === -1){
                        docAddresses.push(doctor["street_address_1"])
                        return doctor
                    }
                }
            })
            localStorage.setItem('medicare', JSON.stringify(docArray));
            console.log(JSON.parse(localStorage.getItem('medicare')))
        })
    }

    function updateDOM (){
        var walgreens = JSON.parse(localStorage.getItem('walgreens'));
        var medicare = JSON.parse(localStorage.getItem('medicare'));
    }
})