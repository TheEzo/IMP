function process_time(){
	var time = parseInt(document.getElementById('time').innerHTML);
	document.getElementById('time').innerHTML = time + 1;
	document.getElementById('h').innerHTML = ("0" + parseInt(time / 3600)).slice(-2);
	document.getElementById('m').innerHTML = ("0" + parseInt((time % 3600) / 60)).slice(-2);
	document.getElementById('s').innerHTML = ("0" + parseInt((time % 3600) % 60)).slice(-2);
}

function load_temp() {
	document.getElementById("temp").innerHTML = 'Loading...';
	var xmlHttp = createXmlHttpRequestObject();
	xmlHttp.addEventListener("load", fill_temp);
	xmlHttp.open("GET", 'http://192.168.4.1/get_temp', true); 
	xmlHttp.send();
}

function load_table() {
	var xmlHttp = createXmlHttpRequestObject();
	xmlHttp.addEventListener("load", fill_table);
	xmlHttp.open("GET", 'http://192.168.4.1/data', true); 
	xmlHttp.send();
}

function load_time() {
	var xmlHttp = createXmlHttpRequestObject();
	xmlHttp.addEventListener("load", function(){document.getElementById('time').innerHTML = this.responseText;});
	xmlHttp.open("GET", 'http://192.168.4.1/get_uptime', true); 
	xmlHttp.send();
}

function fill_table(){
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