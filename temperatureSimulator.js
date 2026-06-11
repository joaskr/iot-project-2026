const CONFIG = {
    LOGIC_APP_URL: "#",
    API_KEY:       "#",
    DEVICE_ID:      "raspberry-pi-01",
    INTERVAL_MS:    5000,       

    TEMP_MIN:       18,
    TEMP_MAX:       26,
    HUMIDITY_MIN:   40,
    HUMIDITY_MAX:   75,

    SPIKE_EVERY:    10,        
    SPIKE_TEMP_MIN: 29,
    SPIKE_TEMP_MAX: 35,
};


let cycleCount = 0;

function generatePayload() {
  cycleCount++;

  const isSpike = (cycleCount % CONFIG.SPIKE_EVERY === 0);

  const temperatura = isSpike
    ? randomFloat(CONFIG.SPIKE_TEMP_MIN, CONFIG.SPIKE_TEMP_MAX)
    : randomFloat(CONFIG.TEMP_MIN, CONFIG.TEMP_MAX);

  const wilgotnosc = randomFloat(CONFIG.HUMIDITY_MIN, CONFIG.HUMIDITY_MAX);

  return {
    DeviceId:    CONFIG.DEVICE_ID,
    Temperatura: round2(temperatura),
    Wilgotnosc:  round2(wilgotnosc),
    isSpike,     
  };
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function round2(val) {
  return Math.round(val * 100) / 100;
}


async function sendTelemetry() {
  const { isSpike, ...payload } = generatePayload();

  console.log(`[${new Date().toISOString()}] Dane:`, JSON.stringify(payload));

  try {
    const response = await fetch(CONFIG.LOGIC_APP_URL, {
      method:  "POST",
      headers: { 
        "Content-Type": "application/json",   
        "x-api-key": CONFIG.API_KEY 
    },
      body:    JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(`Status: ${response.status} — OK`);
    } else {
      const body = await response.text();
      console.error(`Status: ${response.status} — ${body}`);
    }
  } catch (err) {
    console.error(`Błąd połączenia: ${err.message}`);
    console.error("Sprawdź URL Logic App i połączenie sieciowe.");
  }
}


function main() {
  sendTelemetry();
  setInterval(sendTelemetry, CONFIG.INTERVAL_MS);
}

main();