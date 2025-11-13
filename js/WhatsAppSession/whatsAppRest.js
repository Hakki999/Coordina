const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

let clientReady = false;
let client;

function initializeWhatsApp() {
    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--no-first-run',
                '--no-zygote',
                '--single-process', // importante para reduzir RAM
                '--disable-background-networking',
                '--disable-background-timer-throttling',
                '--disable-renderer-backgrounding',
                '--disable-backgrounding-occluded-windows',
            ],
        },
    });

    client.on('qr', qr => {
        console.log('📱 Escaneie o QR Code abaixo com o WhatsApp:');
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log('✅ WhatsApp conectado com sucesso!');
        clientReady = true;
    });

    client.initialize();
}

function sendMSG(number, mensagem) {
    if (!clientReady) {
        console.log('❌ WhatsApp não está pronto. Mensagem não enviada.');
        return
    }

    console.log(number);


    return client.sendMessage(`55${number}@c.us`, mensagem)
        .then(() => console.log('📤 Mensagem enviada com sucesso!'))
        .catch(err => {
            console.error('❌ Erro ao enviar mensagem:', err);
            throw err;
        });
}

// Inicializa o cliente do WhatsApp
 initializeWhatsApp();

 module.exports = { sendMSG };