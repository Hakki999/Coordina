const localtunnel  = require('localtunnel');
require('dotenv').config();

(async () => {
  const tunnel = await localtunnel({
    port: process.env.PORT || 8080,
    subdomain: 'coordina'
  });

  console.log("Tunnel rodando:", tunnel.url);

  tunnel.on('close', () => {
    console.log("Túnel caiu — reiniciando…");
    process.exit(1); // PM2 reinicia automaticamente
  });
})();