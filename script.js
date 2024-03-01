document.addEventListener('DOMContentLoaded', function () {
    const eventSource = new EventSource('/events');
    const messagesContainer = document.getElementById('messages');
    const messageInput = document.getElementById('message-input');
    const nicknameInput = document.getElementById('nickname-input');
    const clearButton = document.getElementById('clear-button'); 

    const savedNickname = localStorage.getItem('nickname');
    if (savedNickname) {
        nicknameInput.value = savedNickname;
        nicknameInput.disabled = true; 
    }

    const savedMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    savedMessages.forEach(message => {
        messagesContainer.innerHTML += `<p>${message}</p>`;
    });

    let lastSenderNickname = null;

    eventSource.onmessage = function (event) {
        const data = JSON.parse(event.data);
        let displayMessage = data.message;
        const senderNickname = data.message.split(': ')[0]; 
        if (senderNickname === lastSenderNickname) {

            displayMessage = data.message.split(': ')[1];
        } else {
            lastSenderNickname = senderNickname;
        }
        messagesContainer.innerHTML += `<p>${displayMessage}</p>`;

        savedMessages.push(data.message);
        localStorage.setItem('chatMessages', JSON.stringify(savedMessages));

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    eventSource.onerror = function (error) {
        console.error('failed:', error);
        eventSource.close();
    };

    messageInput.focus();

    messageInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    clearButton.addEventListener('click', function () {

        messagesContainer.innerHTML = '';

        localStorage.removeItem('chatMessages');
    });
});

function sendMessage() {
    var nicknameInput = document.getElementById('nickname-input');
    var messageInput = document.getElementById('message-input');
    var nickname = nicknameInput.value.trim();
    var message = messageInput.value.trim();
    if (nickname !== '' && message !== '') {
        fetch('/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'nickname=' + encodeURIComponent(nickname) + '&message=' + encodeURIComponent(message),
        })
            .then(response => response.text())
            .then(data => {
                console.log(data);
                messageInput.value = '';
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}