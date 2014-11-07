var ws = require("ws");

var wsUri ="wss://real.okcoin.com:10440/websocket/okcoinapi"; 
var output;

var isConnect =2 ;
function init() {
    output = document.getElementById("output");
    testWebSocket();
setInterval(checkConnect,5000);
}
function checkConnect() {
    if(isConnect == 2)
    {
        testWebSocket()
    }
}

function testWebSocket() {
    websocket = new WebSocket(wsUri);
    websocket.onopen = function(evt) {
  isConnect=1;
        onOpen(evt)
    };
    websocket.onclose = function(evt) {
  isConnect = 2;
        onClose(evt)
    };
    websocket.onmessage = function(evt) {
       onMessage(evt)
    };
    websocket.onerror = function(evt) {
        onError(evt)
    };

}

function onOpen(evt) {
    writeToScreen("CONNECTED");
doSend("{'event':'addChannel','channel':'ok_btcusd_ticker'}");
doSend("{'event':'addChannel','channel':'ok_ltcusd_ticker'}");
doSend("{'event':'addChannel','channel':'ok_btcusd_trades'}");
doSend("{'event':'addChannel','channel':'ok_ltcusd_trades'}");
doSend("{'event':'addChannel','channel':'ok_btcusd_depth'}");
doSend("{'event':'addChannel','channel':'ok_ltcusd_depth'}");
//doSend("{'event':'removeChannel','channel':'ok_ltcusd_depth'}");
//doSend("{'event':'removeChannel','channel':'ok_btcusd_depth'}");
}

function onClose(evt) {
    writeToScreen("DISCONNECTED");
}

function onMessage(evt) {
    //writeToScreen('<span style="color: blue;">RESPONSE: '+ evt.data+'</span>');
      var myList	= evt.data;
      var array = JSON.parse(myList);
      createTable(array);
}

function onError(evt) {
    writeToScreen('<span style="color: red;">ERROR:</span> '+ evt.data);
}

function doSend(message) {
    writeToScreen("SENT: " + message);
    websocket.send(message);
}

function writeToScreen(message) {
    var pre = document.createElement("p");
    pre.style.wordWrap = "break-word";
    pre.innerHTML = message;
   // output.appendChild(pre);

}

window.addEventListener("load", init, false);



function createTable(array){
    //table header
     var  str='<h2 id="th2">WebSocket Test</h2><table id="tdata" border="1"><tr id="tr1">';
    for (var index in array[0]) {
        str += '<th>' + index + '</th>';
    }
    str += '</tr><tr id="tr2">';

    // table body

    for (var i = 0; i < array.length; i++) {

      for (var index in array[i]) {
        var temp=array[i][index];
        str += '<td>';
        var tem=JSON.stringify(temp);
        str += tem;
        str += '</td>';
      }
    str += '</tr>';
    }

  str += '</table>';
  removeTable('tdata');
   document.write(str);
}
 function removeTable(id)
{
    var tbl = document.getElementById(id);
    if(tbl) tbl.parentNode.removeChild(tbl);
    var tt = document.getElementById('th2');
    if(tt) tt.parentNode.removeChild(tt);
}
