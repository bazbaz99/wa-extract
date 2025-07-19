const socket = io();

socket.on('qr', (qr) => {
  document.getElementById('qr-image').src = qr;
  document.getElementById('status').innerText = 'Silakan scan QR';
});

socket.on('ready', () => {
  document.getElementById('status').innerText = 'WhatsApp terhubung!';
});

async function getContacts() {
  const res = await fetch('/get-contacts');
  const data = await res.json();
  alert(data.message);
  if (data.download) window.open(`/${data.download}`, '_blank');
}
