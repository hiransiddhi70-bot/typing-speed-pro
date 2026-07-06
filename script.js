const paragraph = document.getElementById("paragraph");
const input = document.getElementById("input");

const timeElement = document.getElementById("time");
const wpmElement = document.getElementById("wpm");
const accuracyElement = document.getElementById("accuracy");
const mistakesElement = document.getElementById("mistakes");
const cpmElement = document.getElementById("cpm");

const restartBtn = document.getElementById("restart");
const themeBtn = document.getElementById("theme");

const bestScore = document.getElementById("bestScore");
const historyList = document.getElementById("historyList");

const timerButtons = document.querySelectorAll(".time");

let selectedTime = 15;
let timeLeft = selectedTime;
let timer = null;
let started = false;

let mistakes = 0;
let correctChars = 0;

function loadParagraph() {

    const random =
        Math.floor(Math.random() * paragraphs.length);

    paragraph.textContent = paragraphs[random];

    input.value = "";

    timeLeft = selectedTime;
    timeElement.textContent = timeLeft;

    mistakes = 0;
    correctChars = 0;

    mistakesElement.textContent = 0;
    wpmElement.textContent = 0;
    cpmElement.textContent = 0;
    accuracyElement.textContent = "100%";

    started = false;

    clearInterval(timer);

}

loadParagraph();

timerButtons.forEach(button => {

    button.addEventListener("click", () => {

        timerButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        selectedTime =
            Number(button.dataset.time);

        loadParagraph();

    });

});

function startTimer() {

    timer = setInterval(() => {

        timeLeft--;

        timeElement.textContent = timeLeft;

        if (timeLeft <= 0) {

            clearInterval(timer);

            input.disabled = true;

            saveScore();

        }

    },1000);

}

input.addEventListener("input", () => {

    if (!started) {
        started = true;
        input.disabled = false;
        startTimer();
    }

    const original = paragraph.textContent;
    const typed = input.value;

    mistakes = 0;
    correctChars = 0;

    for (let i = 0; i < typed.length; i++) {

        if (typed[i] === original[i]) {
            correctChars++;
        } else {
            mistakes++;
        }

    }

    mistakesElement.textContent = mistakes;

    cpmElement.textContent = correctChars;

    const words = typed.trim().length === 0
        ? 0
        : typed.trim().split(/\s+/).length;

    const elapsed =
        (selectedTime - timeLeft) / 60;

    let wpm = 0;

    if (elapsed > 0) {
        wpm = Math.round(words / elapsed);
    }

    wpmElement.textContent = wpm;

    const accuracy = typed.length === 0
        ? 100
        : Math.round((correctChars / typed.length) * 100);

    accuracyElement.textContent = accuracy + "%";

});
function saveScore() {

    const wpm = Number(wpmElement.textContent);

    let best = localStorage.getItem("bestWPM");

    if (!best || wpm > Number(best)) {

        localStorage.setItem("bestWPM", wpm);

        best = wpm;

    }

    bestScore.textContent = best + " WPM";

    let history =
        JSON.parse(localStorage.getItem("history")) || [];

    history.unshift({
        wpm: wpm,
        accuracy: accuracyElement.textContent,
        mistakes: mistakes,
        date: new Date().toLocaleString()
    });

    history = history.slice(0,5);

    localStorage.setItem(
        "history",
        JSON.stringify(history)
    );

    loadHistory();

}

function loadHistory() {

    const history =
        JSON.parse(localStorage.getItem("history")) || [];

    historyList.innerHTML = "";

    history.forEach(item => {

        const li = document.createElement("li");

        li.innerHTML =
        `<strong>${item.wpm} WPM</strong> |
        Accuracy: ${item.accuracy} |
        Mistakes: ${item.mistakes}`;

        historyList.appendChild(li);

    });

}

restartBtn.addEventListener("click", () => {

    input.disabled = false;

    loadParagraph();

});

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

});

bestScore.textContent =
(localStorage.getItem("bestWPM") || 0) + " WPM";

loadHistory();
function resetFocus() {

    input.focus();

}

window.addEventListener("load", () => {

    input.disabled = false;

    loadParagraph();

    resetFocus();

});

input.addEventListener("blur", () => {

    if (timeLeft > 0) {

        resetFocus();

    }

});

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        input.disabled = false;

        loadParagraph();

        resetFocus();

    }

});

restartBtn.addEventListener("click", () => {

    clearInterval(timer);

    input.disabled = false;

    started = false;

    loadParagraph();

    resetFocus();

});
