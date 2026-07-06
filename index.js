const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

function createNameCard(name) {
    return `
╔════════════╗
║ ✨ NAME CARD ✨ ║
╠════════════╣
║ Name: ${name}
║ Status: Active
║ Bot: SameerBot
╚════════════╝
`;
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, qr } = update;
        if(qr) {
            qrcode.generate(qr, {small: true});
        }
        if(connection === 'close') {
            startBot();
        } else if(connection === 'open') {
            console.log('Bot Connected!');
        }
    });

    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        const from = msg.key.remoteJid;

        if(text && text.startsWith('!card')) {
            const name = text.replace('!card', '').trim();
            if(name) {
                const card = createNameCard(name);
                await sock.sendMessage(from, { text: card });
            } else {
                await sock.sendMessage(from, { text: 'مثال:!card Sameer' });
            }
        }
    });
}

startBot();
