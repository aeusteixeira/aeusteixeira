window.onload = function() {
    // Array de emojis
    const emojis = ['❤️', '😊', '👫', '🤝', '🎷🐛', '💐😼', '🫵😍', '🧃🦕', '🗿🍷', '🎮👥🤔', '👅 🍆 💦', '🍆🧎🏼‍♂️'];


  
    // Função para criar um emoji aleatório
    function createEmoji() {
      const emoji = document.createElement('div');
      emoji.classList.add('emoji');
      emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      emoji.style.left = Math.random() * 100 + 'vw';
      emoji.style.animationDuration = Math.random() * 2 + 3 + 's'; 
      document.getElementById('app').appendChild(emoji);
      
      // Remove o emoji após a animação
      setTimeout(() => {
        emoji.remove();
      }, 5000);
    }
  
    // Cria um emoji a cada 500 milissegundos
    setInterval(createEmoji, 500);
}
