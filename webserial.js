const serialResultsDiv = document.getElementById("serialResults");
let port, textEncoder, writableStreamClosed, readableStreamClosed, writer, reader, ws;
let connectedFlag = false;

async function connectSerial() {
    try {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });
        textEncoder = new TextEncoderStream();
        writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
        writer = textEncoder.writable.getWriter();
        //listenToPort();
        connected();
        console.log("Webserial connected");
    } catch {
        await serDisconnect();
        console.log("Webserial disconnected");
        alert("Serial Connection Failed");
    }
}
async function listenToPort() {
    const textDecoder = new TextDecoderStream();
    //const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();
    try {
        while (true) {
            const {value, done} = await reader.read();
            if (done) {
                reader.releaseLock();
                break;
            }
            await appendToTerminal(value);
        }
    } catch {
        await reader.cancel();
        await readableStreamClosed.catch(() => {/*alan*/
        });
        await serDisconnect();
        console.log("listenToPort error");
    }
}
async function sendSerialMsg(sermsg){
    await writer.write(sermsg + '\n');
    console.log(sermsg);
    await listenToPort();
}
async function serDisconnect() {
    if(writer){
        await writer.close();
        await writer.releaseLock();
        await writableStreamClosed;
    }
    if(reader){
        reader.releaseLock();
        reader.cancel();
        await readableStreamClosed.catch(() => {/*alan*/});
        reader = null;
    }
    if(port){await port.close();}
}
function connected() {
    connectedFlag = true;
    document.getElementById("cmdLine").value = "";
    document.getElementById("cmdLine").value = "gong plat 1";
    document.getElementById("cmdLine").style.backgroundColor = "Green";
    document.getElementById("cmdButton").onclick = disconnected;
    document.getElementById("cmdButton").innerHTML = "Disconnect";
}
async function disconnected() {
    connectedFlag = false;
    await serDisconnect();
    document.getElementById("cmdLine").value = "";
    document.getElementById("cmdLine").value = "9600";
    document.getElementById("cmdLine").style.backgroundColor = "dimgrey";
    document.getElementById("cmdButton").onclick = connectSerial;
    document.getElementById("cmdButton").innerHTML = "Connect";
}
async function appendToTerminal(newStuff) {
    serialResultsDiv.innerHTML += "\n"+newStuff;
    if (serialResultsDiv.innerHTML.length > 3000) serialResultsDiv.innerHTML = serialResultsDiv.innerHTML.slice(serialResultsDiv.innerHTML.length - 3000);
    serialResultsDiv.scrollTop = serialResultsDiv.scrollHeight;
}
document.getElementById("cmdLine").addEventListener("keyup", async function (event) {
    if(!connectedFlag && event.key === "13") {await connectSerial();}
    if (event.keyCode === 13) {await sendSerialMsg(document.getElementById("cmdLine").value);}
})
