const ROOT_ID = 1;
const ROOT_NAME = "~"
const DATA_ID = 0;
const DATA_VALUE = 1;

class AOORADatabaseClient{
    constructor(){
        this.data = null;
        this.idPath = [ROOT_ID];
        this.namePath = [ROOT_NAME];
    }

    fetchDB(handler){
        let xhttp = new XMLHttpRequest();
        xhttp.open("GET", "data.php", true);
        xhttp.overrideMimeType('text/html; charset=iso-8859-1');
        xhttp.setRequestHeader('Content-Type', 'application/octet-stream');
        xhttp.responseType = 'text';
        xhttp.app = this;
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                window.response = this.responseText;
                this.app.loadData(JSON.parse(this.responseText));
                handler();
            }
        }
        xhttp.send();
    }

    loadData(data){
        this.data = data;
    }

    getCurrentId(){
        return this.idPath[this.idPath.length - 1];
    }

    getPath(){
        return this.namePath.join("/");
    }

    at(id){
        let left = 0;
        let right = this.data.length - 1;
        while (left <= right) {
            let mid = left + Math.floor((right - left) / 2);
            let midValue = this.data[mid][DATA_ID];
            if (midValue === id) {
                return this.data[mid][DATA_VALUE];
            }
            else if (midValue < id) {
                left = mid + 1;
            }
            else {
                right = mid - 1;
            }
        }
        return null;
    }

    list(){
        return this.at(this.getCurrentId());
    }

    ascend(){
        if (this.idPath.length > 1){
            this.idPath.pop();
            this.namePath.pop();
        }
    }

    descend(id, value){
        this.idPath.push(id);
        this.namePath.push(value);
    }


}

class AOORADatabase{
    constructor(HTMLElement, pathElement, ascendElement){
        this.AOORADBClient = new AOORADatabaseClient();
        this.tableElement = HTMLElement;
        this.pathElement = pathElement;
        this.ascendElement = ascendElement;
    }

    start(){
        this.ascendElement.addEventListener("click", this.clickAscend.bind(this));
        this.AOORADBClient.fetchDB(this.updateTable.bind(this));
    }

    loadData(data){
        this.AOORADBClient.loadData(data);
    }

    viewLoading(){
        this.tableElement.innerHTML = "";
        let row = this.tableElement.insertRow(-1);
        let domain = row.insertCell(-1);
        domain.innerHTML = "Loading, please wait...";
        domain.style.textAlign = "center";
        domain.style.fontWeight = "bold";
        domain.colSpan = 2;
    }

    updateTable(){
        this.tableElement.innerHTML = "";
        this.pathElement.innerHTML = this.AOORADBClient.getPath();
        this.AOORADBClient.list().forEach(function(lowerNode, i){
            let row = this.tableElement.insertRow(-1);
            row.insertCell(-1).innerHTML = i+1;
            row.insertCell(-1).innerHTML = lowerNode[DATA_VALUE];
            row.addEventListener("click", this.clickDescend.bind(this, lowerNode));
        }.bind(this));
    }

    clickAscend(){
        this.AOORADBClient.ascend();
        this.updateTable();
    }

    clickDescend(lowerNode){
        if (this.AOORADBClient.at(lowerNode[DATA_ID])){
            this.AOORADBClient.descend(lowerNode[DATA_ID], lowerNode[DATA_VALUE]);
            this.updateTable();
        }
    }
}

class AOORADatabaseApp{
    constructor(){
        this.HTMLTable = document.getElementById("VisualTable");
        this.pathElement = document.getElementById("VisualPath");
        this.ascendElement = document.getElementById("AscendButton");
        this.AOORADB = new AOORADatabase(this.HTMLTable, this.pathElement, this.ascendElement);
    }

    run(){
        this.AOORADB.start();
        this.AOORADB.viewLoading();
    }
}

window.addEventListener("load", function(){
    new AOORADatabaseApp().run();
});