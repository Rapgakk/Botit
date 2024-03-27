let sentMessageId = null; // Variabel untuk menyimpan ID pesan yang telah terkirim

function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.getElementById('clock').textContent = timeString;

    // Periksa apakah jam saat ini adalah 07:00
    if (hours === 7 && minutes === 0 && seconds === 0) {
        sendMessageToDiscord('Waktunya On Duty @everyone ');
    }

    // Periksa apakah jam saat ini adalah 19:00
    if (hours === 19 && minutes === 0 && seconds === 0) {
        sendMessageToDiscord('Waktunya Selesai On Duty, Selamat BerIstirahat  @everyone');
    }
}

function sendMessageToDiscord(message) {
    // Ganti URL webhook dengan URL webhook Discord Anda
    const webhookUrl = 'https://discord.com/api/webhooks/1222392427176787989/4QScK8sPULCpjC-LB0Ldvymfw6AExUG8KrwjfallWAeIHXql272Gp_2sNlQcqEHBoKIR';

    // Buat payload untuk pesan Discord
    const payload = {
        content: message,
    };

    // Kirim pesan ke Discord menggunakan metode POST
    fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
    .then(response => {
        if (response.ok) {
            console.log('Message sent to Discord successfully:', message);
            // Jika respons adalah JSON, ambil ID pesan dari respons
            if (response.headers.get('content-type').includes('application/json')) {
                response.json().then(data => {
                    const messageId = data.id;
                    // Setelah pesan terkirim, atur penundaan 1 jam untuk menghapus pesan
                    setTimeout(() => {
                        deleteMessageFromDiscord(webhookUrl, messageId);
                    }, 3600000); // 1 jam dalam milidetik (1000 ms = 1 detik)

                    // Setelah pesan terkirim, berikan delay untuk mengirim teks "?purge 5"
                    setTimeout(() => {
                        sendMessageToDiscord('?purge 5');
                    }, 2000); // Delay 5 detik untuk mengirim teks "?purge 5"
                });
            }
        } else {
            console.error('Failed to send message to Discord:', message);
            // Tangani respons yang tidak sesuai dengan format JSON
            response.text().then(text => {
                console.error('Response from Discord:', text);
            });
        }
    })
    .catch(error => {
        console.error('Error sending message to Discord:', error);
    });
}

function deleteMessageFromDiscord(webhookUrl, messageId) {
    // Jika ID pesan tidak ada, tidak perlu melanjutkan penghapusan
    if (!messageId) {
        console.error('Message ID is missing.');
        return;
    }

    // Kirim permintaan DELETE ke Discord untuk menghapus pesan
    fetch(`${webhookUrl}/messages/${messageId}`, {
        method: 'DELETE',
    })
    .then(deleteResponse => {
        if (deleteResponse.ok) {
            console.log('Message deleted from Discord successfully:', messageId);
        } else {
            console.error('Failed to delete message from Discord:', messageId);
        }
    })
    .catch(error => {
        console.error('Error deleting message from Discord:', error);
    });
}

// Panggil fungsi updateClock setiap detik
setInterval(updateClock, 1000);

// Panggil updateClock sekali saat halaman dimuat pertama kali
updateClock();
