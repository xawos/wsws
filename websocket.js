const wsResultsDiv = document.getElementById("wsResults");
async function connectWs(){
    ws = new WebSocket(document.getElementById("wscmdLine").value);
    ws.onopen = function() {
        wsconnected();
        console.log("Websocket connected");
    };
    ws.onmessage = function (evt) {
        let received_msg = evt.data;
        console.log("Message received: " + received_msg);
        let jmsg = JSON.parse(received_msg);
        let rmsg;
        try {
            rmsg = jmsg.data.message.text;
            appendTowsTerminal(jmsg.data.message.createTime);
            appendTowsTerminal(rmsg);
            if (port) {
                sendSerialMsg(rmsg);
            }
            appendTowsTerminal("");
        } catch {
            console.log("I was expecting a Chat message, wtf is that?");
        }
    };
    ws.onclose = function() {
        console.log("Websocket is now closed.");
        wsdisconnected();
    };
}
async function sendWsLine(){
    let msg = document.getElementById("wscmdLine").value;
    if(ws){
        ws.send(msg);
    }
    document.getElementById("wscmdLine").value = "";
}
function wsconnected() {
    connectedFlag = true;
    document.getElementById("wscmdLine").value = "";
    document.getElementById("wscmdLine").value = "";
    document.getElementById("wscmdLine").style.backgroundColor = "Green";
    document.getElementById("wscmdButton").onclick = wsdisconnected;
    document.getElementById("wscmdButton").innerHTML = "Disconnect";
}
function wsdisconnected() {
    connectedFlag = false;
    if(ws){ws.close();}
    document.getElementById("wscmdLine").value = "";
    document.getElementById("wscmdLine").value = "ws://localhost";
    document.getElementById("wscmdLine").style.backgroundColor = "dimgrey";
    document.getElementById("wscmdButton").onclick = connectWs;
    document.getElementById("wscmdButton").innerHTML = "Connect";
}
async function appendTowsTerminal(newStuff) {
    wsResultsDiv.innerHTML += "\n"+newStuff;
    if (wsResultsDiv.innerHTML.length > 3000) wsResultsDiv.innerHTML = wsResultsDiv.innerHTML.slice(wsResultsDiv.innerHTML.length - 3000);
    wsResultsDiv.scrollTop = wsResultsDiv.scrollHeight;
}
document.getElementById("wscmdLine").addEventListener("keyup", async function (event) {
    if(!connectedFlag && event.key === "13") {await connectWs(wsResultsDiv.innerHTML);}
    if (event.keyCode === 13) {await sendWsLine();}
})
