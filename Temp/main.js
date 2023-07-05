let idMap = [
	{HTMLTableId: 'Alert', dataType: 'Alert'},
	{HTMLTableId: 'Stopper', dataType: 'Stopper'},
	{HTMLTableId: 'Examination', dataType: 'Förhör'},
	{HTMLTableId: 'Schooltasks', dataType: 'Uppgift'},
	{HTMLTableId: 'Tickets', dataType: 'Tickets'},
	{HTMLTableId: 'Improvements', dataType: 'Improvements'},
	{HTMLTableId: 'Reminder', dataType: 'Reminder'},
	{HTMLTableId: 'Daily', dataType: 'Daily'}
]

class HTMLViewerBase{
	constructor(HTMLElement){
		this.HTMLElement = HTMLElement;
	}
}

class HTMLDynamicViewTable extends HTMLViewerBase{
	create_table_domain(content){
		let td = document.createElement("td");
		td.innerHTML = content;
		return td;
	}
	
	update(new_data){
		let tableHead = this.HTMLElement.children[0].children[0].outerHTML;
		this.HTMLElement.innerHTML = tableHead;
		for (let data_row of new_data){
			let row = document.createElement("tr");
			row.appendChild(this.create_table_domain(data_row.datetime))
			row.appendChild(this.create_table_domain(data_row.course))
			row.appendChild(this.create_table_domain(data_row.title))
			this.HTMLElement.appendChild(row)
		}
	}
}

class HTMLDynamicViewCards extends HTMLViewerBase{
	update(new_data){
		
	}
}

class ActivityDataController{
	#data;
	constructor(data){
		this.#data = ActivityDataController.sortData(data);
	}
	
	static sortData(data){
		return data.filter(x => new Date(x.datetime + ' 23:59:59') > new Date()).sort(function(a, b){
			if (a.datetime < b.datetime) {
				return -1;
			}
			else {
				return 1;
			}
		});
	}
	
	setData(newData){
		this.#data = ActivityDataController.sortData(data);
	}
	
	getData(){
		return this.#data;
	}
	
	filterType(type_name){
		return this.#data.filter(x => x.type == type_name)
	}
}

class ActivityController{
	constructor(data){
		this.dataController = new ActivityDataController(data);
	}
	
	update(){
		for (let item of idMap){
			let HTMLElement = document.getElementById(item.HTMLTableId);
			let UsefulData = this.dataController.filterType(item.dataType);
			new HTMLDynamicViewTable(HTMLElement).update(UsefulData);
		}
	}
}

a = new ActivityController(activityData);
a.update();