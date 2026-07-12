// DOM Element Selections
const textDisplay = document.getElementById("text-display");
const keyboardInput = document.getElementById("keyboard-input");
const timerDisplay = document.getElementById("timer");
const wpmDisplay = document.getElementById("wpm");
const cpmDisplay = document.getElementById("cpm");
const accuracyDisplay = document.getElementById("accuracy");
const mistakesDisplay = document.getElementById("mistakes");
const bestScoreDisplay = document.getElementById("best-score");
const restartBtn = document.getElementById("restart-btn");
const timeButtons = document.querySelectorAll(".time-btn");
const themeToggle = document.getElementById("theme-toggle");
const historyList = document.getElementById("history-list");
const typingBox = document.querySelector(".typing-box");

// Game State Variables
let maxTime = 15;
let timeLeft = maxTime;
let timer = null;
let isTyping = false;
let charIndex = 0;
let mistakes = 0;
let totalTyped = 0;
let testHistory = JSON.parse(localStorage.getItem("typingTestHistory")) || [];

// Initialize Game
function initGame() {
    loadParagraph();
    loadBestScore();
    loadHistoryUI();
    resetStats();
    
    // Auto-focus setup
    typingBox.addEventListener("click", () => keyboardInput.focus());
    document.addEventListener("click", (e) => {
        if (!typingBox.contains(e.target) && e.target !== restartBtn && !e.target.classList.contains('time-btn')) {
            // Keep input focused if user intends to type
        }
    });
}

// Load random paragraph and format characters into individual spans
function loadParagraph() {
    const randomIndex = Math.floor(Math.random() * paragraphs.length);
    textDisplay.innerHTML = "";
    
    paragraphs[randomIndex].split("").forEach(char => {
        let span = document.createElement("span");
        span.innerText = char;
        textDisplay.appendChild(span);
    });
    
    if(textDisplay.firstChild) {
        textDisplay.firstChild.classList.add("current");
    }
}

// Handle real-time typing logic
function handleTyping(e) {
    const characters = textDisplay.querySelectorAll("span");
    let typedChar = keyboardInput.value.split("")[charIndex];
    
    if (charIndex < characters.length && timeLeft > 0) {
        // Start timer on first keystroke
        if (!isTyping) {
            timer = setInterval(startTimer, 1000);
            isTyping = true;
        }

        // Handle Backspace (If allowed/implemented via value tracking, otherwise standard input handles forward)
        if (typedChar == null) {
            if (charIndex > 0) {
                charIndex--;
                if (characters[charIndex].classList.contains("incorrect")) {
                    mistakes--;
                }
                characters[charIndex].classList.remove("correct", "incorrect");
            }
        } else {
            // Check character correctness
            if (characters[charIndex].innerText === typedChar) {
                characters[charIndex].classList.add("correct");
            } else {
                mistakes++;
                characters[charIndex].classList.add("incorrect");
            }
            charIndex++;
            totalTyped++;
        }

        // Update active cursor placement
        characters.forEach(span => span.classList.remove("current"));
        if(charIndex < characters.length) {
            characters[charIndex].classList.add("current");
        }

        // Calculate real-time live metrics
        let timeElapsed = maxTime - timeLeft;
        if (timeElapsed <= 0) timeElapsed = 1; // Prevent division by zero

        // Standard WPM calculation: (Correct characters / 5) / Time in minutes
        let correctChars = charIndex - mistakes;
        let wpm = Math.round(((correctChars / 5) / timeElapsed) * 60);
        wpm = wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm;

        let cpm = Math.round((correctChars / timeElapsed) * 60);
        cpm = cpm < 0 || !cpm || cpm === Infinity ? 0 : cpm;

        let accuracy = Math.round(((charIndex - mistakes) / charIndex) * 100);
        accuracy = charIndex === 0 ? 100 : (accuracy < 0 ? 0 : accuracy);

        // Update View Display
        wpmDisplay.innerText = wpm;
        cpmDisplay.innerText = cpm;
        mistakesDisplay.innerText = mistakes;
        accuracyDisplay.innerText = accuracy + "%";
    } else {
        clearInterval(timer);
        keyboardInput.value = "";
    }
}

// Timer functionality
function startTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        timerDisplay.innerText = timeLeft;
        
        // Dynamic update of WPM even if user stops typing near the end
        let timeElapsed = maxTime - timeLeft;
        let correctChars = charIndex - mistakes;
        let wpm = Math.round(((correctChars / 5) / timeElapsed) * 60);
        wpmDisplay.innerText = wpm > 0 ? wpm : 0;
    } else {
        clearInterval(timer);
        endTest();
    }
}

// Test End and Save Results
function endTest() {
    keyboardInput.blur();
    const finalWpm = parseInt(wpmDisplay.innerText);
    const finalAccuracy = accuracyDisplay.innerText;

    // Update Best Score in Local Storage
    let currentBest = localStorage.getItem("bestWpm") || 0;
    if (finalWpm > currentBest) {
        localStorage.setItem("bestWpm", finalWpm);
        bestScoreDisplay.innerText = finalWpm;
    }

    // Save test performance to history array
    const testResult = {
        wpm: finalWpm,
        accuracy: finalAccuracy,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    testHistory.unshift(testResult); // Push to top of stack
    if(testHistory.length > 10) testHistory.pop(); // Limit history to last 10 entries
    
    localStorage.setItem("typingTestHistory", JSON.stringify(testHistory));
    loadHistoryUI();
}

// Stats Reset utility
function resetStats() {
    clearInterval(timer);
    timeLeft = maxTime;
    charIndex = 0;
    mistakes = 0;
    totalTyped = 0;
    isTyping = false;
    keyboardInput.value = "";
    timerDisplay.innerText = timeLeft;
    wpmDisplay.innerText = "0";
    cpmDisplay.innerText = "0";
    mistakesDisplay.innerText = "0";
    accuracyDisplay.innerText = "100%";
}

// Reset button handler
function restartTest() {
    resetStats();
    loadParagraph();
    keyboardInput.focus();
}

// Load high score wrapper
function loadBestScore() {
    bestScoreDisplay.innerText = localStorage.getItem("bestWpm") || 0;
}

// Load and populate User History Interface
function loadHistoryUI() {
    historyList.innerHTML = "";
    testHistory.forEach(item => {
        let li = document.createElement("li");
        li.innerHTML = `<span><strong>${item.wpm} WPM</strong> (${item.accuracy} Acc)</span> <span>${item.date}</span>`;
        historyList.appendChild(li);
    });
}

// Event Listeners for configurations
timeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        timeButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        maxTime = parseInt(btn.getAttribute("data-time"));
        restartTest();
    });
});

keyboardInput.addEventListener("input", handleTyping);
restartBtn.addEventListener("click", restartTest);

// Dark / Light Theme Switching Setup
themeToggle.addEventListener("click", () => {
    const currentTheme = document.body.getAttribute("data-theme");
    if (currentTheme === "dark") {
        document.body.removeAttribute("data-theme");
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    } else {
        document.body.setAttribute("data-theme", "dark");
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
});

// Run Application On Load
window.onload = initGame;
