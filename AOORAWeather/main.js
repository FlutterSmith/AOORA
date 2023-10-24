class AOORAFetchData{
    constructor(){
        
    }

    fetch(handler){
        let xhttp = new XMLHttpRequest();
        xhttp.open("GET", "AOORAWeatherFetch.php", true);
        xhttp.setRequestHeader('Access-Control-Allow-Origin', '*');
        xhttp.responseType = 'text';
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                window.response = this.responseText;
                handler(this.responseText);
            }
        }
        xhttp.send();
    }

}

class AOORATraffic{
    constructor(){
        this.aoorafetch = new AOORAFetchData();
        this.aoorafetch.fetch(this.handler.bind(this));
    }

    handler(trafficData){
        trafficData = JSON.parse(trafficData);
        console.log(trafficData);
    }
}

class AOORAWeatherApp{
    constructor(){
        this.atraffic = new AOORATraffic();
    }
    
    run(){
        
    }
    
}


window.addEventListener("load", function(){
    new AOORAWeatherApp().run();
})