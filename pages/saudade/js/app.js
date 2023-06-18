const startButton = document.getElementById("start-button");
const introSection = document.getElementById("intro-section");
const gameSection = document.getElementById("game-section");
const carousel = document.getElementById("carousel");
const musicPlayer = document.getElementById("music-player");
const bgMusic = document.querySelector("audio");

startButton.addEventListener("click", () => {
  introSection.classList.add("hidden");
  gameSection.classList.remove("hidden");
  startGame();
});

function startGame() {
  // Entrar em tela cheia
  const body = document.querySelector("body");
  if (body.requestFullscreen) {
    body.requestFullscreen();
  } else if (body.mozRequestFullScreen) {
    body.mozRequestFullScreen();
  } else if (body.webkitRequestFullscreen) {
    body.webkitRequestFullscreen();
  } else if (body.msRequestFullscreen) {
    body.msRequestFullscreen();
  }

  // Exibir o carrossel e o player de música
  carousel.classList.remove("hidden");
  musicPlayer.classList.remove("hidden");

  const slides = document.querySelectorAll('.slide');
let currentSlide = 0;

function showSlide(index) {
  slides.forEach((slide, i) => {
    if (i === index) {
      slide.classList.add('active');
    } else {
      slide.classList.remove('active');
    }
  });
}

function nextSlide() {
  currentSlide++;
  if (currentSlide >= slides.length) {
    currentSlide = 0;
  }
  showSlide(currentSlide);
}

function previousSlide() {
  currentSlide--;
  if (currentSlide < 0) {
    currentSlide = slides.length - 1;
  }
  showSlide(currentSlide);
}

setInterval(nextSlide, 6000); // Altere o tempo para a transição dos slides, se necessário


  // Iniciar a música de fundo
  bgMusic.play();
}
