const dgram = require('dgram');
const axios = require('axios');

const PORT = 5005;
const BACKEND_IP = process.env.BACKEND_IP || 'localhost';
const BASE_URL = `http://${BACKEND_IP}:8080/brts`;
const BUS_ID = 2; // <-- ID fixo do autocarro a atualizar

const server = dgram.createSocket('udp4');

server.on('error', (err) => {
  console.error('❌ Erro no servidor UDP:', err.message);
  server.close();
});

server.on('message', async (msg, rinfo) => {
  console.log(`📨 Pacote UDP recebido de ${rinfo.address}:${rinfo.port}`);
  try {
    const data = JSON.parse(msg.toString());

    if (data.sensordata && data.sensordata.gps) {
      const { latitude, longitude } = data.sensordata.gps;

      if (typeof latitude === 'number' && typeof longitude === 'number') {
        const patchUrl = `${BASE_URL}/${BUS_ID}/localizacao`;
        const payload = { latitude, longitude };

        try {
          await axios.patch(patchUrl, payload);
          console.log(`✅ PATCH enviado para /brts/${BUS_ID}/localizacao:`, payload);
        } catch (err) {
          console.error('❌ Erro ao enviar PATCH para backend:', err.message);
        }
      } else {
        console.warn('⚠️ Coordenadas inválidas:', data.sensordata.gps);
      }
    } else {
      console.warn('⚠️ Dados inesperados no pacote:', data);
    }
  } catch (err) {
    console.error('❌ Erro ao processar pacote UDP:', err.message);
  }
});

server.bind(PORT, () => {
  console.log(`🛰️  Servidor UDP a escutar na porta ${PORT}`);
});
