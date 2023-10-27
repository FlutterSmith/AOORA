class AOORAFileReader{
	constructor(readerElement, handler){
		this.readerElement = readerElement;
		this.handler = handler;
		this.run();
	}
	
	readContents(evt){
		this.handler(evt.target.result);
	}
	
	readFile(evt){
		let file = evt.target.files[0];
		if (!file){
			return;
		}
		let reader = new FileReader();
        reader.onload = this.readContents.bind(this);
        reader.readAsText(file);
	}
	
	run(){
		this.readerElement.addEventListener("change", this.readFile.bind(this));
	}
}

class AOORADBToolsApp{
	constructor(){
		this.fileChooser = document.getElementById("FileChooser");
		this.fileReader = new AOORAFileReader(this.fileChooser, this.parse.bind(this));
	}
		
	toSQL(node, upperId = 1, id = 2, nameTable = "", relationship = ""){
		for (let lowerNode of node){
			relationship += `INSERT INTO relationship VALUES (${upperId}, ${id}, 1);\n`
			if (typeof lowerNode === "object" && lowerNode !== null){
				let key = Object.keys(lowerNode)[0];
			    let value = Object.values(lowerNode)[0];
				let name = key.replaceAll('"', '""');
				nameTable += `INSERT INTO nameTable VALUES (${id}, "${name}");\n`;
				if (value){
					[nameTable, relationship, id] = this.toSQL(value, id, id+1, nameTable, relationship);
				}
				id ++;
			}
			else if (typeof lowerNode === "string"){
				let name = lowerNode.replaceAll('"', '""');
				nameTable += `INSERT INTO nameTable VALUES (${id}, "${name}");\n`;
				id ++;
			}
		}
		return [nameTable, relationship, id-1];
	}
	
	write(fileName, data){
		let writer = document.createElement("a");
        let blob = new Blob([data], {type: 'octet/stream'});
        let url = window.URL.createObjectURL(blob);
        writer.href = url;
        writer.download = fileName;
		writer.click();
	}
	
	parse(rawData){
		let data = jsyaml.load(rawData, "utf-8");
		let [nameTable, relationship, id] = this.toSQL(data);
		nameTable = 'DELETE FROM nameTable;\nINSERT INTO nameTable VALUES (1, "Root");\n' + nameTable;
		relationship = 'DELETE FROM relationship;\n' + relationship;
		console.log(nameTable);
		console.log(relationship);
		this.write("nameTable.sql", nameTable);
		this.write("relationship.sql", relationship);
	}
	
	run(){
		console.log("running");
	}
}

window.addEventListener("load", function(){
    new AOORADBToolsApp().run();
});