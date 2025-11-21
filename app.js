/* -----------------------------------------
   متغيرات عامة
------------------------------------------*/
let device = null;
let server = null;
let service = null;
let characteristic = null;
let sending = false;

/* -----------------------------------------
   قائمة الأنماط (Patterns)
------------------------------------------*/
const patterns = {
  "Spiral": "G1 R=30 T=720 S=40",
  "Flower": "G1 R=20 T=1080 S=35",
  "Infinity": "G1 R=15 T=1440 S=45",
  "Star": "G1 R=25 T=720 S=30",
  "Wave": "G1 R=18 T=900 S=40",
  "Circle": "G1 R=35 T=360 S=50",
  "Galaxy": "G1 R=40 T=1440 S=60",
  "Butterfly": "G1 R=22 T=1080 S=35",
  "Diamond": "G1 R=28 T=720 S=45",
  "Leaf": "G1 R=17 T=900 S=30"
};

/* -----------------------------------------
   إضافة الأنماط للقائمة في الواجهة
------------------------------------------*/
const patternSelect = document.getElementById("patternSelect");

for (let name in patterns) {
  let option = document.createElement("option");
  option.value = name;
  option.textContent = name;
  patternSelect.appendChild(option);
}

/* -----------------------------------------
   الاتصال بالبلوتوث
------------------------------------------*/
document.getElementById("btnConnect").onclick = async () => {
  try {
    device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ["0000ffe0-0000-1000-8000-00805f9b34fb"]
    });

    server = await device.gatt.connect();
    document.getElementById("status").textContent = "متصل";

    service = await server.getPrimaryService("0000ffe0-0000-1000-8000-00805f9b34fb");
    characteristic = await service.getCharacteristic("0000ffe1-0000-1000-8000-00805f9b34fb");

  } catch (error) {
    log("خطأ الاتصال: " + error);
  }
};

/* -----------------------------------------
   إرسال أمر نصي إلى ESP32
------------------------------------------*/
async function sendCommand(cmd) {
  if (!characteristic) {
    log("❌ غير متصل بالبلوتوث!");
    return;
  }

  try {
    let data = new TextEncoder().encode(cmd + "\n");
    await characteristic.writeValue(data);
    log("✔️ تم الإرسال: " + cmd);
  } catch (e) {
    log("❌ خطأ: " + e);
  }
}

/* -----------------------------------------
   تشغيل النمط
------------------------------------------*/
document.getElementById("btnStart").onclick = () => {
  let selected = patternSelect.value;

  if (selected === "") {
    log("❌ اختر نمطًا!");
    return;
  }

  let command = patterns[selected];
  sendCommand(command);
};

/* -----------------------------------------
   إيقاف
------------------------------------------*/
document.getElementById("btnStop").onclick = () => {
  sendCommand("STOP");
};

/* -----------------------------------------
   تحميل ملف TXT وإرساله
------------------------------------------*/
document.getElementById("btnSendFile").onclick = async () => {
  let fileInput = document.getElementById("fileInput");

  if (!fileInput.files.length) {
    log("❌ لم يتم اختيار ملف");
    return;
  }

  let file = fileInput.files[0];
  let text = await file.text();
  let lines = text.split("\n");

  sending = true;

  for (let line of lines) {
    if (!sending) break;
    await sendCommand(line.trim());
    await new Promise(r => setTimeout(r, 50));
  }
};

document.getElementById("btnStopSend").onclick = () => {
  sending = false;
  log("⛔ تم إيقاف الإرسال");
};

/* -----------------------------------------
   طباعة سجل الأحداث
------------------------------------------*/
function log(txt) {
  let logBox = document.getElementById("log");
  logBox.textContent += txt + "\n";
  logBox.scrollTop = logBox.scrollHeight;
}
