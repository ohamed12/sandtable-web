const NUS_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const TX_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
const RX_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

let device, server, tx, rx;

function log(t){
  const box = document.getElementById("log");
  box.textContent += t + "\n";
  box.scrollTop = box.scrollHeight;
}

document.getElementById("btnConnect").onclick = async()=>{
  try{
    device = await navigator.bluetooth.requestDevice({
      filters:[{services:[NUS_SERVICE_UUID]}],
      optionalServices:[NUS_SERVICE_UUID]
    });
    server = await device.gatt.connect();
    const service = await server.getPrimaryService(NUS_SERVICE_UUID);
    tx = await service.getCharacteristic(TX_UUID);
    rx = await service.getCharacteristic(RX_UUID);
    await rx.startNotifications();
    rx.addEventListener("characteristicvaluechanged", e=>{
      log("← " + new TextDecoder().decode(e.target.value));
    });
    document.getElementById("status").textContent = "حالة: متصل";
    log("متصل بنجاح");
  }catch(e){
    log("خطأ: "+e);
  }
};

async function send(line){
  if(!tx){alert("اتصل أولاً"); return;}
  if(!line.endsWith("\n")) line+="\n";
  await tx.writeValue(new TextEncoder().encode(line));
  log("→ " + line.trim());
}

document.getElementById("btnStart").onclick = ()=>{
  const p = document.getElementById("patternSelect").value;
  if(!p){alert("اختر نمط"); return;}
  if(p==="CUSTOM"){
    send(document.getElementById("custom").value.trim());
  }else{
    send("PATTERN "+p);
  }
};

document.getElementById("btnStop").onclick = ()=> send("STOP");
