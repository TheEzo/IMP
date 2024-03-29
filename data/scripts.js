/**************************
 * IMP - ESP8266          *
 * Tomas Willaschek       *
 * xwilla00               *
 * original - 18-12-2018  *
 **************************/

function process_time(){
	// handle function to process time leaded from server
	var time = parseInt(document.getElementById('time').innerHTML);
	document.getElementById('time').innerHTML = time + 1;
	document.getElementById('h').innerHTML = ("0" + parseInt(time / 3600)).slice(-2);
	document.getElementById('m').innerHTML = ("0" + parseInt((time % 3600) / 60)).slice(-2);
	document.getElementById('s').innerHTML = ("0" + parseInt((time % 3600) % 60)).slice(-2);
}

function load_temp() {
	// sends request to server to get temperature
	document.getElementById("temp").innerHTML = 'Loading...';
	var xmlHttp = createXmlHttpRequestObject();
	xmlHttp.addEventListener("load", fill_temp);
	xmlHttp.open("GET", 'http://192.168.4.1/get_temp', true); 
	xmlHttp.send();
}

function load_table() {
	// sends request to server to get table data
	var xmlHttp = createXmlHttpRequestObject();
	xmlHttp.addEventListener("load", fill_table);
	xmlHttp.open("GET", 'http://192.168.4.1/data', true); 
	xmlHttp.send();
}

function load_time() {
	// sends request to server to get system uptime
	var xmlHttp = createXmlHttpRequestObject();
	xmlHttp.addEventListener("load", function(){document.getElementById('time').innerHTML = this.responseText;});
	xmlHttp.open("GET", 'http://192.168.4.1/get_uptime', true); 
	xmlHttp.send();
}

function fill_table(){
	// fill data into table, handler of load_table()
	var data = this.responseText.split(';').slice(0,-1);
	var res = "";
	var avg = 0.0;
	for(i in data){
		if(i < 10)
			avg += parseFloat(data[i]);
	    res += '<tr class="' + ((i%2) ? 'a' : 'b') + '"><td>' + i + '</td><td>' + data[i] + '</td></tr>';
	}
	document.getElementById('avg').innerHTML = parseFloat(avg/10).toFixed(2);
	document.getElementById('table-body').innerHTML = res;
}

function fill_temp() {
	// fill temperature into html, load_temp() handler
	document.getElementById('sun').className = 'hidden';
	document.getElementById('ice').className = 'hidden';
	document.getElementById('cloud').className = 'hidden';
	document.getElementById("temp").innerHTML = this.responseText;
	if (parseFloat(document.getElementById("temp").innerHTML < 0.0))
		document.getElementById('ice').className = '';
	else if (parseFloat(document.getElementById("temp").innerHTML < 20.0))
		document.getElementById('cloud').className = '';
	else
		document.getElementById('sun').className = '';
}

function createXmlHttpRequestObject() {
	// create ajax connector 
  	var xmlhttp;
	try {
		xmlHttp = new XMLHttpRequest();
	} catch (e) { 
		try {
			xmlHttp = new ActiveXObject("Microsoft.XMLHttp");
		} catch (e) {}
	}
	if (!xmlHttp) {
		alert ("Error creating the XMLHttpRequest object.");
	} else {
		return xmlHttp;
	}
}