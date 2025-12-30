const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');

class WhatsappAdapter {
    constructor() {
        this.sock = null;
    }

    async start() {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

        this.sock = makeWASocket({
            printQRInTerminal: true, // You scan this once
            auth: state
        });

        this.sock.ev.on('creds.update', saveCreds);

        this.sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log('WhatsApp connection closed, reconnecting...', shouldReconnect);
                if (shouldReconnect) this.start();
            } else if (connection === 'open') {
                console.log('>> WhatsApp Connected');
            }
        });
    }

    async sendMessage(jid, text) {
        if (!this.sock) return;
        await this.sock.sendMessage(jid, { text: text });
    }

    // Baileys listens to events for messages
    onMessage(callback) {
        if (!this.sock) return;
        this.sock.ev.on('messages.upsert', async m => {
            const msg = m.messages[0];
            if (!msg.key.fromMe && m.type === 'notify') {
                callback(msg);
            }
        });
    }
}

module.exports = WhatsappAdapter;
