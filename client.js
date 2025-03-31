const socket = io();
let currentUser = null;

document.getElementById('registerBtn').addEventListener('click', registerUser);
document.getElementById('theButton').addEventListener('click', pressButton);
document.getElementById('resetBtn').addEventListener('click', resetGame);

function registerUser() {
    const name = document.getElementById('nameInput').value.trim();
    const role = document.getElementById('roleSelect').value;
    
    if (!name) {
        alert('Please enter your name');
        return;
    }
    
    currentUser = { name, role };
    socket.emit('register', currentUser);
    
    document.getElementById('registration').style.display = 'none';
    
    if (role === 'admin') {
        document.getElementById('adminView').style.display = 'block';
    } else {
        document.getElementById('game').style.display = 'block';
    }
}

function pressButton() {
    socket.emit('pressButton');
    document.getElementById('theButton').classList.add('pressed');
    document.getElementById('theButton').disabled = true;
}

function resetGame() {
    socket.emit('resetGame');
}

socket.on('update', (data) => {
    if (data.buttonPressed) {
        document.getElementById('theButton').classList.add('pressed');
        document.getElementById('theButton').disabled = true;
        
        if (data.winner) {
            document.getElementById('winnerMessage').textContent = 
                data.winner === currentUser.name 
                ? "You won! 🎉" 
                : `${data.winner} was first!`;
        }
    }
});

socket.on('adminUpdate', (users) => {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';
    
    Object.values(users).forEach(user => {
        const userElement = document.createElement('div');
        userElement.textContent = `${user.name} (${user.role})`;
        userList.appendChild(userElement);
    });
});

socket.on('buttonPressed', (winnerName) => {
    if (currentUser && currentUser.role === 'admin') {
        document.getElementById('winnerAnnouncement').textContent = 
            `The winner is: ${winnerName}!`;
    }
});

// For admin reset functionality - you'd need to add this to server.js
socket.on('gameReset', () => {
    buttonPressed = false;
    winner = null;
    document.getElementById('theButton').classList.remove('pressed');
    document.getElementById('theButton').disabled = false;
    document.getElementById('winnerMessage').textContent = '';
    
    if (currentUser && currentUser.role === 'admin') {
        document.getElementById('winnerAnnouncement').textContent = '';
    }
});