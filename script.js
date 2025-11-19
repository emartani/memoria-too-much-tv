const allPhrases = [
  {
    en: "Obesity.",
    pt: "Obesidade.",
    img: "obesity.png"
  },
  {
    en: "Poor sleep.",
    pt: "Sono ruim",
    img: "poor sleep.jpg"
  },
  {
    en: "Behavior problems.",
    pt: "Problemas de comportamento.",
    img: "behavior problems.jpeg"
  },
  {
    en: "Poor grades.",
    pt: "Notas ruins.",
    img: "poor grades.jpg"
  },
  {
    en: "Myopia.",
    pt: "Miopia.",
    img: "myopia.webp"
  }
];

const flipSound = new Audio("sounds/flip.mp3");
const matchSound = new Audio("sounds/match.mp3");
const wrongSound = new Audio("sounds/wrong.mp3");
const celebrationSound = new Audio("sounds/celebration.mp3");
celebrationSound.volume = 1.0;

let selected = [];
let matched = [];
let isLocked = false;
let cards = [];

// Sempre inicia com 10 cartas (5 pares)
function startGame() {
  const grid = document.getElementById("gameGrid");
  grid.innerHTML = "";
  selected = [];
  matched = [];
  isLocked = false;

  grid.className = "grid";
  grid.classList.add("fixed-grid");

  // Fala a frase em português ao iniciar
  speak("O que pode acontecer se você passar muito tempo nas telas!", "pt-BR");

  // 5 frases → duplicadas = 10 cartas
  let phrases = shuffleArray(allPhrases).slice(0, 5);
  cards = [...phrases, ...phrases].sort(() => 0.5 - Math.random());

  cards.forEach((phrase, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.index = index;
    card.innerHTML = "";
    card.onclick = () => flipCard(card, phrase);
    grid.appendChild(card);
  });
}

function flipCard(card, phrase) {
  if (isLocked || matched.includes(card.dataset.index) || selected.includes(card)) return;

  // Exibe o conteúdo da carta
  card.innerHTML = `
    <img src="images/${phrase.img}" alt="" />
    <div>${phrase.en}</div>
    <div class="translation">${phrase.pt}</div>
  `;

  flipSound.play();

  // Toca a frase apenas no primeiro card
  if (selected.length === 0) {
    speak(phrase.en, "en-US"); // fala em inglês
    setTimeout(() => speak(phrase.pt, "pt-BR"), 1500); // fala em português depois
  }

  selected.push(card);

  if (selected.length === 2) {
    isLocked = true;

    const [card1, card2] = selected;

    // Verifica se os textos são iguais e os cards são diferentes
    if (card1.innerText === card2.innerText && card1 !== card2) {
      matched.push(card1.dataset.index, card2.dataset.index);
      card1.classList.add("matched");
      card2.classList.add("matched");
      matchSound.play();
      isLocked = false;

      // Verifica se o jogo terminou
      if (matched.length === cards.length) {
        setTimeout(() => {
          speechSynthesis.cancel(); // interrompe qualquer fala em andamento
          celebrationSound.currentTime = 0;
          celebrationSound.play();
          document.getElementById("congratsScreen").style.display = "flex";
        }, 1000);
      }

    } else {
      // Par incorreto → fala a frase do segundo card
      speak(phrase.en, "en-US");
      setTimeout(() => speak(phrase.pt, "pt-BR"), 1500);
      wrongSound.play();
      setTimeout(() => {
        card1.innerHTML = "";
        card2.innerHTML = "";
        isLocked = false;
      }, 4000);
    }

    selected = [];
  }
}

function speak(text, lang = "en-US") {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  speechSynthesis.speak(utterance);
}

function shuffleArray(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function restartGame() {
  document.getElementById("congratsScreen").style.display = "none";
  document.querySelector(".menu").style.display = "block";
  document.getElementById("gameGrid").innerHTML = "";
}
