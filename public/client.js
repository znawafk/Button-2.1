const socket = io({
  transports: ['websocket'],
  upgrade: false,
  forceNew: true,
  reconnectionAttempts: 3,
  timeout: 2000
});

let currentUser = null;

// Connection error handling
socket.on('connect_error', (err) => {
  console.error('Connection error:', err);
  alert('Failed to connect to game server. Please refresh.');
});

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
  document.getElementById(role === 'admin' ? 'adminView' : 'game').style.display = 'block';
}

function pressButton() {
  socket.emit('pressButton');
  document.getElementById('theButton').classList.add('pressed');
  document.getElementById('theButton').disabled = true;
}

function resetGame() {
  socket.emit('resetGame');
}

// Socket event listeners
socket.on('update', (data) => {
  const button = document.getElementById('theButton');
  button.disabled = data.buttonPressed;
  button.classList.toggle('pressed', data.buttonPressed);
  
  if (data.winner) {
    document.getElementById('winnerMessage').textContent = 
      data.winner === currentUser?.name ? "You won! 🎉" : `${data.winner} won!`;
  }
});

socket.on('adminUpdate', (users) => {
  const userList = document.getElementById('userList');
  userList.innerHTML = Object.values(users).map(user => 
    `<div>${user.name} (${user.role})</div>`
  ).join('');
});

socket.on('gameReset', () => {
  const button = document.getElementById('theButton');
  button.disabled = false;
  button.classList.remove('pressed');
  document.getElementById('winnerMessage').textContent = '';
  
  if (currentUser?.role === 'admin') {
    document.getElementById('winnerAnnouncement').textContent = '';
  }
});
