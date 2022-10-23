let port, textEncoder, writableStreamClosed, writer, ws;
let connectedFlag = false;

async function connectSerial() {
  try {
      port = await navigator.serial.requestPort();
      await port.open({ baudRate: document.getElementById("cmdLine").value });
      listenToPort();
      textEncoder = new TextEncoderStream();
      writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
      writer = textEncoder.writable.getWriter();
      connected();
  } catch {
      disconnected();
      alert("Serial Connection Failed");
  }
}

function connected() {
    connectedFlag = true;
    document.getElementById("cmdLine").value = "";
    document.getElementById("cmdLine").value = "gong plat 1";
    document.getElementById("cmdButton").onclick = sendSerialLine;
    document.getElementById("cmdButton").innerHTML = "Send";
}

function disconnected() {
    connectedFlag = false;
    document.getElementById("cmdLine").value = "";
    document.getElementById("cmdLine").value = "115200";
    document.getElementById("cmdButton").onclick = connectSerial;
    document.getElementById("cmdButton").innerHTML = "Connect";
}

async function sendSerialLine() {
  let dataToSend = document.getElementById("cmdLine").value;
  await writer.write(dataToSend);
  document.getElementById("cmdLine").value = "";
  await writer.releaseLock();
}

async function listenToPort() {
  const textDecoder = new TextDecoderStream();
  const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
  const reader = textDecoder.readable.getReader();
  while (true) {
      const { value, done } = await reader.read();
      if (done) {
          reader.releaseLock();
          break;
      }
      await appendToTerminal(value);
  }
}

async function connectWs(){
    ws = new WebSocket(document.getElementById("wscmdLine").value);
    ws.onopen = function() {
        wsconnected();
    };
    ws.onmessage = function (evt) {
        let received_msg = evt.data;
        console.log("Message received: " + received_msg);
        appendTowsTerminal(received_msg);
    };
    ws.onclose = function() {
        console.log("Websocket connection is now closed.");
        wsdisconnected();
    };
}
function wsconnected() {
    connectedFlag = true;
    document.getElementById("wscmdLine").value = "";
    document.getElementById("wscmdLine").value = "Websocket connected";
    document.getElementById("wscmdButton").onclick = sendWsLine;
    document.getElementById("wscmdButton").innerHTML = "Send";
}
function wsdisconnected() {
    connectedFlag = false;
    document.getElementById("wscmdLine").value = "";
    document.getElementById("wscmdLine").value = "ws://localhost";
    document.getElementById("wscmdButton").onclick = connectWs;
    document.getElementById("wscmdButton").innerHTML = "Connect";
}
async function sendWsLine(){
    let msg = document.getElementById("wscmdLine").value;
    if(ws){
        ws.send(msg);
    }
}

const serialResultsDiv = document.getElementById("serialResults");
const wsResultsDiv = document.getElementById("wsResults");

async function appendToTerminal(newStuff) {
  serialResultsDiv.innerHTML += newStuff;
  if (serialResultsDiv.innerHTML.length > 3000) serialResultsDiv.innerHTML = serialResultsDiv.innerHTML.slice(serialResultsDiv.innerHTML.length - 3000);
  serialResultsDiv.scrollTop = serialResultsDiv.scrollHeight;
}

document.getElementById("cmdLine").addEventListener("keyup", async function (event) {
  if(!connectedFlag && event.key === "13") {await connectSerial();}
  if (event.keyCode === 13) {await sendSerialLine();}
})

async function appendTowsTerminal(newStuff) {
    wsResultsDiv.innerHTML += newStuff;
    if (wsResultsDiv.innerHTML.length > 3000) wsResultsDiv.innerHTML = wsResultsDiv.innerHTML.slice(wsResultsDiv.innerHTML.length - 3000);
    wsResultsDiv.scrollTop = wsResultsDiv.scrollHeight;
}

document.getElementById("wscmdLine").addEventListener("keyup", async function (event) {
    if(!connectedFlag && event.key === "13") {await connectWs(wsResultsDiv.innerHTML);}
    if (event.keyCode === 13) {await sendWsLine();}
})