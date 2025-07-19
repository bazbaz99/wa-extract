const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const XLSX = require('xlsx');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', async (qr) => {
  const qrImage = await qrcode.toDataURL(qr);
  io.emit('qr', qrImage);
});

client.on('ready', () => {
  io.emit('ready');
});

client.on('authenticated', () => {
  io.emit('authenticated');
});

app.get('/get-contacts', async (req, res) => {
  const chats = await client.getChats();
  const data = chats.map(chat => ({
    number: chat.id.user,
    name: chat.name || chat.contact.name || chat.contact.pushname || 'Tidak diketahui'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');

  const filename = `exports/contacts-${Date.now()}.xlsx`;
  XLSX.writeFile(workbook, filename);

  res.json({ message: 'Export sukses', download: filename });
});

io.on('connection', socket => {
  console.log('Frontend terhubung ke WebSocket');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Server running on port', PORT);
});

client.initialize();
