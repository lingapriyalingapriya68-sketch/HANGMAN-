# 🪢 Modern Web-Based Hangman Game

A feature-rich, responsive, and animated Hangman web application built with modern HTML5, CSS3, JavaScript, and Web Audio API.

---

## ✨ Features

- **🎨 Modern Visual Design**:
  - Dark Mode and Light Mode with smooth theme transitions.
  - Interactive SVG hangman scaffold that animates and updates with each guess.
  - Dynamic facial expressions: smile on victory, dead cross eyes on defeat.
  - Floating confetti celebration particles on winning.

- **🔤 Comprehensive Vocabulary & Categories**:
  - **🦁 Animals** (Elephant, Giraffe, Platypus, Chameleon, etc.)
  - **💻 Programming** (Python, JavaScript, Algorithm, Polymorphism, etc.)
  - **🌍 Countries** (Brazil, Germany, Madagascar, Switzerland, etc.)
  - **🍕 Food & Cooking** (Pizza, Biryani, Guacamole, Ratatouille, etc.)
  - **🚀 Science & Space** (Galaxy, Supernova, Photosynthesis, Blackhole, etc.)
  - **🎬 Movies & Pop Culture** (Hollywood, Cinematography, Blockbuster, etc.)
  - **🌟 All / Mixed Category Mode**

- **🎯 Difficulty Modes**:
  - **Easy**: 8 lives + animated face details.
  - **Medium (Classic)**: 6 lives (Head, Torso, Arms, Legs).
  - **Hard**: 4 lives for an intense challenge.

- **💡 Clue & Hint System**:
  - Each word has a contextual clue/definition to test your vocabulary knowledge.
  - Optional bonus letter reveal when stuck.

- **⌨️ Dual Keyboard Input**:
  - **Tactile On-Screen QWERTY Keyboard** with status color feedback (green for correct, red/strikethrough for wrong).
  - **Hardware Keyboard Support**: Type `A-Z` directly, use `Enter` or `Space` to advance, and `Esc` to close dialogs.

- **🔊 Web Audio API Procedural Sound Effects**:
  - Key click, correct chime, wrong buzz, hint sparkle, victory fanfare, and game over sounds.
  - 100% synthesized in real time (zero external MP3 assets, zero network latency, works completely offline).
  - Mute/Unmute sound toggle.

- **📊 Persistent Score & Streak Tracking**:
  - Total games played, win rate percentage, current streak, best streak, and lifetime high score.
  - Saved in browser `localStorage`.

---

## 🚀 How to Run the Game

### Option 1: Direct in Browser (No Server Needed)
Simply double-click [`index.html`](file:///c:/Users/GKM/Documents/python/index.html) or open it with Google Chrome, Edge, Firefox, or Safari.

### Option 2: Run with Python Local Server
Open a terminal in this directory and run:
```bash
python server.py
```
This will start a local server at `http://localhost:8000` and automatically open your default browser.

---

## 📁 File Structure

- [`index.html`](file:///c:/Users/GKM/Documents/python/index.html) - Main semantic HTML structure, SVG hangman illustration, and UI modals.
- [`style.css`](file:///c:/Users/GKM/Documents/python/style.css) - Responsive CSS, themes (dark/light), animations, and glassmorphism.
- [`words.js`](file:///c:/Users/GKM/Documents/python/words.js) - Categorized word database with clues and difficulty ratings.
- [`audio.js`](file:///c:/Users/GKM/Documents/python/audio.js) - Web Audio API procedural sound synthesizer.
- [`script.js`](file:///c:/Users/GKM/Documents/python/script.js) - Core game logic, state machine, input handling, and confetti engine.
- [`server.py`](file:///c:/Users/GKM/Documents/python/server.py) - Python development server with automatic browser launching.
- [`hangman_cli.py`](file:///c:/Users/GKM/Documents/python/hangman_cli.py) - Original Python console version (preserved for reference).
