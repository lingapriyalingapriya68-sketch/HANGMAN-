/**
 * Hangman Classic Web Game Engine
 */

class HangmanGame {
    constructor() {
        this.category = 'all';
        this.difficulty = 'medium';
        this.maxLives = 6;
        this.remainingLives = 6;
        this.currentWord = '';
        this.currentClue = '';
        this.guessedLetters = new Set();
        this.wrongLetters = [];
        this.clueRevealed = false;
        this.hintsAvailable = 1;
        this.gameStatus = 'playing'; // 'playing' | 'won' | 'lost'

        // Persistent stats
        this.stats = this.loadStats();
        this.score = 0;
        this.streak = 0;

        // Sound & Theme state
        this.isMuted = localStorage.getItem('hangman_muted') === 'true';
        this.theme = localStorage.getItem('hangman_theme') || 'dark';

        this.initDOM();
        this.bindEvents();
        this.applyTheme(this.theme);
        this.updateSoundButton();
        this.startNewGame();
    }

    loadStats() {
        const defaultStats = {
            played: 0,
            won: 0,
            bestStreak: 0,
            highScore: 0
        };
        try {
            const saved = localStorage.getItem('hangman_stats');
            return saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats;
        } catch (e) {
            return defaultStats;
        }
    }

    saveStats() {
        localStorage.setItem('hangman_stats', JSON.stringify(this.stats));
    }

    initDOM() {
        // Elements
        this.lettersContainer = document.getElementById('letters-container');
        this.wrongChipsContainer = document.getElementById('wrong-chips');
        this.scoreDisplay = document.getElementById('score-display');
        this.streakDisplay = document.getElementById('streak-display');
        this.livesContainer = document.getElementById('lives-icons');
        this.categoryBadge = document.getElementById('category-badge');
        this.categorySelect = document.getElementById('select-category');
        this.difficultySelect = document.getElementById('select-difficulty');
        this.clueBox = document.getElementById('clue-box');
        this.clueText = document.getElementById('clue-text');
        this.btnHint = document.getElementById('btn-hint');
        this.hintsLeftSpan = document.getElementById('hints-left');

        // Buttons
        this.btnNewRound = document.getElementById('btn-new-round');
        this.btnGiveUp = document.getElementById('btn-give-up');
        this.btnTheme = document.getElementById('btn-theme');
        this.btnSound = document.getElementById('btn-sound');
        this.btnStats = document.getElementById('btn-stats');
        this.btnRules = document.getElementById('btn-rules');

        // Modals
        this.modalWin = document.getElementById('modal-win');
        this.modalLose = document.getElementById('modal-lose');
        this.modalStats = document.getElementById('modal-stats');
        this.modalRules = document.getElementById('modal-rules');

        // Modal Action buttons
        this.btnWinNext = document.getElementById('btn-win-next');
        this.btnLoseRetry = document.getElementById('btn-lose-retry');
        this.btnCloseStats = document.getElementById('btn-close-stats');
        this.btnResetStats = document.getElementById('btn-reset-stats');
        this.btnCloseRules = document.getElementById('btn-close-rules');
        this.btnRulesGotIt = document.getElementById('btn-rules-got-it');

        // SVG Hangman Parts
        this.svgParts = {
            head: document.getElementById('part-head'),
            eyeL: document.getElementById('part-eye-l'),
            eyeR: document.getElementById('part-eye-r'),
            smile: document.getElementById('part-smile'),
            deadFace: document.getElementById('part-dead-face'),
            torso: document.getElementById('part-torso'),
            armL: document.getElementById('part-arm-l'),
            armR: document.getElementById('part-arm-r'),
            legL: document.getElementById('part-leg-l'),
            legR: document.getElementById('part-leg-r')
        };

        this.renderKeyboard();
    }

    bindEvents() {
        // Theme & Sound toggles
        this.btnTheme.addEventListener('click', () => this.toggleTheme());
        this.btnSound.addEventListener('click', () => this.toggleSound());

        // Category & Difficulty changes
        this.categorySelect.addEventListener('change', (e) => {
            this.category = e.target.value;
            this.startNewGame();
        });

        this.difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.startNewGame();
        });

        // Hint button
        this.btnHint.addEventListener('click', () => this.revealHint());

        // Game actions
        this.btnNewRound.addEventListener('click', () => {
            soundManager.playKeyClick();
            this.startNewGame();
        });

        this.btnGiveUp.addEventListener('click', () => {
            if (this.gameStatus === 'playing') {
                this.handleDefeat();
            }
        });

        // Modals
        this.btnStats.addEventListener('click', () => this.openStatsModal());
        this.btnRules.addEventListener('click', () => this.openModal(this.modalRules));

        this.btnCloseStats.addEventListener('click', () => this.closeModal(this.modalStats));
        this.btnResetStats.addEventListener('click', () => this.resetStats());
        this.btnCloseRules.addEventListener('click', () => this.closeModal(this.modalRules));
        this.btnRulesGotIt.addEventListener('click', () => this.closeModal(this.modalRules));

        this.btnWinNext.addEventListener('click', () => {
            this.closeModal(this.modalWin);
            this.startNewGame();
        });

        this.btnLoseRetry.addEventListener('click', () => {
            this.closeModal(this.modalLose);
            this.startNewGame();
        });

        // Close modal when clicking backdrop
        [this.modalWin, this.modalLose, this.modalStats, this.modalRules].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });

        // Physical Keyboard listener
        window.addEventListener('keydown', (e) => this.handlePhysicalKey(e));
    }

    renderKeyboard() {
        const rows = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
        ];

        rows.forEach((rowLetters, idx) => {
            const rowElem = document.getElementById(`kb-row-${idx + 1}`);
            rowElem.innerHTML = '';
            rowLetters.forEach(letter => {
                const btn = document.createElement('button');
                btn.className = 'key-btn';
                btn.textContent = letter;
                btn.id = `key-${letter}`;
                btn.setAttribute('aria-label', `Guess letter ${letter}`);
                btn.addEventListener('click', () => this.handleGuess(letter));
                rowElem.appendChild(btn);
            });
        });
    }

    resetKeyboard() {
        document.querySelectorAll('.key-btn').forEach(btn => {
            btn.className = 'key-btn';
            btn.disabled = false;
        });
    }

    startNewGame() {
        // Set lives based on difficulty
        if (this.difficulty === 'easy') {
            this.maxLives = 8;
        } else if (this.difficulty === 'hard') {
            this.maxLives = 4;
        } else {
            this.maxLives = 6;
        }
        this.remainingLives = this.maxLives;

        this.guessedLetters.clear();
        this.wrongLetters = [];
        this.clueRevealed = false;
        this.hintsAvailable = 1;
        this.gameStatus = 'playing';

        // Select Word
        this.selectWord();

        // Reset UI
        this.resetKeyboard();
        this.resetHangmanSVG();
        this.renderLives();
        this.renderWordSlots();
        this.renderWrongChips();
        this.updateStatsUI();

        // Reset clue box
        this.clueBox.classList.add('hidden');
        this.clueText.textContent = this.currentClue;
        this.hintsLeftSpan.textContent = this.hintsAvailable;
        this.btnHint.disabled = false;
    }

    selectWord() {
        let pool = [];
        if (this.category === 'all') {
            Object.values(HANGMAN_WORDS).forEach(catWords => {
                pool.push(...catWords);
            });
        } else if (HANGMAN_WORDS[this.category]) {
            pool = HANGMAN_WORDS[this.category];
        }

        if (!pool || pool.length === 0) {
            pool = HANGMAN_WORDS["Animals"];
        }

        // Filter slightly by difficulty if possible, else take any
        const filtered = pool.filter(item => item.diff === this.difficulty);
        const source = filtered.length > 0 ? filtered : pool;
        const chosen = source[Math.floor(Math.random() * source.length)];

        this.currentWord = chosen.word.toUpperCase();
        this.currentClue = chosen.clue;

        // Find which category this belongs to for badge
        let matchedCategory = this.category;
        if (this.category === 'all') {
            for (const [catName, catList] of Object.entries(HANGMAN_WORDS)) {
                if (catList.some(item => item.word === this.currentWord)) {
                    matchedCategory = catName;
                    break;
                }
            }
        }
        this.categoryBadge.textContent = matchedCategory === 'all' ? 'Mixed' : matchedCategory;
    }

    renderLives() {
        this.livesContainer.innerHTML = '';
        for (let i = 0; i < this.maxLives; i++) {
            const heart = document.createElement('span');
            heart.className = 'heart';
            heart.textContent = '❤️';
            if (i >= this.remainingLives) {
                heart.classList.add('lost');
            }
            this.livesContainer.appendChild(heart);
        }
    }

    renderWordSlots() {
        this.lettersContainer.innerHTML = '';
        const wordArr = this.currentWord.split('');

        wordArr.forEach(char => {
            const slot = document.createElement('div');
            slot.className = 'letter-slot';
            slot.dataset.char = char;

            if (char === ' ' || char === '-') {
                slot.textContent = char;
                slot.style.borderBottom = 'none';
                slot.style.background = 'transparent';
            } else if (this.guessedLetters.has(char)) {
                slot.textContent = char;
                slot.classList.add('revealed');
            } else {
                slot.textContent = '';
            }

            this.lettersContainer.appendChild(slot);
        });
    }

    renderWrongChips() {
        if (this.wrongLetters.length === 0) {
            this.wrongChipsContainer.innerHTML = '<em style="color: var(--text-muted); font-size: 0.8rem;">None yet</em>';
            return;
        }

        this.wrongChipsContainer.innerHTML = '';
        this.wrongLetters.forEach(letter => {
            const chip = document.createElement('span');
            chip.className = 'wrong-chip';
            chip.textContent = letter;
            this.wrongChipsContainer.appendChild(chip);
        });
    }

    resetHangmanSVG() {
        Object.values(this.svgParts).forEach(part => {
            if (part) {
                part.classList.remove('visible');
            }
        });
    }

    updateHangmanSVG() {
        const mistakes = this.maxLives - this.remainingLives;

        if (this.difficulty === 'medium') { // 6 lives
            // 1: Head, 2: Torso, 3: Arm L, 4: Arm R, 5: Leg L, 6: Leg R
            if (mistakes >= 1) this.svgParts.head.classList.add('visible');
            if (mistakes >= 2) this.svgParts.torso.classList.add('visible');
            if (mistakes >= 3) this.svgParts.armL.classList.add('visible');
            if (mistakes >= 4) this.svgParts.armR.classList.add('visible');
            if (mistakes >= 5) this.svgParts.legL.classList.add('visible');
            if (mistakes >= 6) {
                this.svgParts.legR.classList.add('visible');
                this.svgParts.deadFace.classList.add('visible');
            }
        } else if (this.difficulty === 'easy') { // 8 lives
            // 1: Head, 2: Face, 3: Torso, 4: Arm L, 5: Arm R, 6: Leg L, 7: Leg R, 8: Dead face
            if (mistakes >= 1) this.svgParts.head.classList.add('visible');
            if (mistakes >= 2 && mistakes < 8) {
                this.svgParts.eyeL.classList.add('visible');
                this.svgParts.eyeR.classList.add('visible');
                this.svgParts.smile.classList.add('visible');
            }
            if (mistakes >= 3) this.svgParts.torso.classList.add('visible');
            if (mistakes >= 4) this.svgParts.armL.classList.add('visible');
            if (mistakes >= 5) this.svgParts.armR.classList.add('visible');
            if (mistakes >= 6) this.svgParts.legL.classList.add('visible');
            if (mistakes >= 7) this.svgParts.legR.classList.add('visible');
            if (mistakes >= 8) {
                this.svgParts.eyeL.classList.remove('visible');
                this.svgParts.eyeR.classList.remove('visible');
                this.svgParts.smile.classList.remove('visible');
                this.svgParts.deadFace.classList.add('visible');
            }
        } else if (this.difficulty === 'hard') { // 4 lives
            // 1: Head, 2: Torso, 3: Both Arms, 4: Both Legs + Dead face
            if (mistakes >= 1) this.svgParts.head.classList.add('visible');
            if (mistakes >= 2) this.svgParts.torso.classList.add('visible');
            if (mistakes >= 3) {
                this.svgParts.armL.classList.add('visible');
                this.svgParts.armR.classList.add('visible');
            }
            if (mistakes >= 4) {
                this.svgParts.legL.classList.add('visible');
                this.svgParts.legR.classList.add('visible');
                this.svgParts.deadFace.classList.add('visible');
            }
        }
    }

    handleGuess(letter) {
        if (this.gameStatus !== 'playing') return;
        if (this.guessedLetters.has(letter) || this.wrongLetters.includes(letter)) return;

        const keyBtn = document.getElementById(`key-${letter}`);

        if (this.currentWord.includes(letter)) {
            // Correct Guess
            this.guessedLetters.add(letter);
            if (keyBtn) {
                keyBtn.classList.add('correct');
                keyBtn.disabled = true;
            }

            soundManager.playCorrect();
            this.renderWordSlots();
            this.checkWinCondition();
        } else {
            // Wrong Guess
            this.wrongLetters.push(letter);
            this.remainingLives--;
            if (keyBtn) {
                keyBtn.classList.add('wrong');
                keyBtn.disabled = true;
            }

            soundManager.playWrong();
            this.renderLives();
            this.renderWrongChips();
            this.updateHangmanSVG();

            if (this.remainingLives <= 0) {
                this.handleDefeat();
            }
        }
    }

    revealHint() {
        if (this.hintsAvailable <= 0 || this.gameStatus !== 'playing') return;

        this.hintsAvailable--;
        this.hintsLeftSpan.textContent = this.hintsAvailable;
        this.btnHint.disabled = true;
        this.clueRevealed = true;
        this.clueBox.classList.remove('hidden');

        soundManager.playHint();

        // If player hasn't guessed half the letters, reveal 1 unrevealed letter as bonus
        const unrevealed = this.currentWord.split('').filter(c => !this.guessedLetters.has(c) && c !== ' ' && c !== '-');
        if (unrevealed.length > 2) {
            const randomChar = unrevealed[Math.floor(Math.random() * unrevealed.length)];
            this.handleGuess(randomChar);
        }
    }

    checkWinCondition() {
        const isComplete = this.currentWord.split('').every(char => {
            return char === ' ' || char === '-' || this.guessedLetters.has(char);
        });

        if (isComplete) {
            this.handleVictory();
        }
    }

    handleVictory() {
        this.gameStatus = 'won';
        soundManager.playWin();

        // Living happy face
        this.svgParts.eyeL.classList.add('visible');
        this.svgParts.eyeR.classList.add('visible');
        this.svgParts.smile.classList.add('visible');

        // Points Calculation
        const diffMultiplier = this.difficulty === 'hard' ? 2 : (this.difficulty === 'medium' ? 1.5 : 1);
        const basePoints = this.currentWord.length * 15;
        const lifeBonus = this.remainingLives * 25;
        const streakBonus = this.streak * 10;
        const hintDeduction = this.clueRevealed ? 20 : 0;
        const roundPoints = Math.round((basePoints + lifeBonus + streakBonus - hintDeduction) * diffMultiplier);

        this.score += roundPoints;
        this.streak++;

        // Update stats
        this.stats.played++;
        this.stats.won++;
        if (this.streak > this.stats.bestStreak) {
            this.stats.bestStreak = this.streak;
        }
        if (this.score > this.stats.highScore) {
            this.stats.highScore = this.score;
        }
        this.saveStats();
        this.updateStatsUI();

        // Populate Victory Modal
        document.getElementById('win-word').textContent = this.currentWord;
        document.getElementById('win-clue').textContent = this.currentClue;
        document.getElementById('win-round-points').textContent = `+${roundPoints}`;
        document.getElementById('win-round-streak').textContent = `🔥 ${this.streak}`;

        // Launch Confetti
        ConfettiCelebration.start();

        setTimeout(() => {
            this.openModal(this.modalWin);
        }, 400);
    }

    handleDefeat() {
        this.gameStatus = 'lost';
        this.remainingLives = 0;
        this.renderLives();
        this.updateHangmanSVG();
        soundManager.playLose();

        // Reveal missing letters in red
        const slots = this.lettersContainer.querySelectorAll('.letter-slot');
        slots.forEach(slot => {
            if (!slot.textContent) {
                slot.textContent = slot.dataset.char;
                slot.classList.add('missed');
            }
        });

        // Reset streak
        this.streak = 0;
        this.stats.played++;
        this.saveStats();
        this.updateStatsUI();

        // Populate Defeat Modal
        document.getElementById('lose-word').textContent = this.currentWord;
        document.getElementById('lose-clue').textContent = this.currentClue;

        setTimeout(() => {
            this.openModal(this.modalLose);
        }, 600);
    }

    updateStatsUI() {
        this.scoreDisplay.textContent = this.score;
        this.streakDisplay.textContent = this.streak;
    }

    openStatsModal() {
        const winRate = this.stats.played > 0 
            ? Math.round((this.stats.won / this.stats.played) * 100) 
            : 0;

        document.getElementById('stat-played').textContent = this.stats.played;
        document.getElementById('stat-winrate').textContent = `${winRate}%`;
        document.getElementById('stat-best-streak').textContent = this.stats.bestStreak;
        document.getElementById('stat-high-score').textContent = this.stats.highScore;

        this.openModal(this.modalStats);
    }

    resetStats() {
        if (confirm("Are you sure you want to reset all game statistics?")) {
            this.stats = { played: 0, won: 0, bestStreak: 0, highScore: 0 };
            this.score = 0;
            this.streak = 0;
            this.saveStats();
            this.updateStatsUI();
            this.openStatsModal();
        }
    }

    openModal(modal) {
        modal.classList.add('active');
    }

    closeModal(modal) {
        modal.classList.remove('active');
        ConfettiCelebration.stop();
    }

    handlePhysicalKey(e) {
        // Prevent key capture if user is focusing an input or select
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

        // Space or Enter to proceed on modal
        if (e.key === 'Enter' || e.key === ' ') {
            if (this.modalWin.classList.contains('active')) {
                this.closeModal(this.modalWin);
                this.startNewGame();
                return;
            }
            if (this.modalLose.classList.contains('active')) {
                this.closeModal(this.modalLose);
                this.startNewGame();
                return;
            }
        }

        // Escape closes any active modal
        if (e.key === 'Escape') {
            [this.modalWin, this.modalLose, this.modalStats, this.modalRules].forEach(m => this.closeModal(m));
            return;
        }

        // If any modal is active, don't guess letters
        const isModalActive = [this.modalWin, this.modalLose, this.modalStats, this.modalRules].some(m => m.classList.contains('active'));
        if (isModalActive) return;

        const letter = e.key.toUpperCase();
        if (/^[A-Z]$/.test(letter)) {
            this.handleGuess(letter);
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme(this.theme);
        localStorage.setItem('hangman_theme', this.theme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.btnTheme.textContent = theme === 'dark' ? '☀️' : '🌙';
        this.btnTheme.title = theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme';
    }

    toggleSound() {
        this.isMuted = soundManager.toggleMute();
        this.updateSoundButton();
    }

    updateSoundButton() {
        this.btnSound.textContent = this.isMuted ? '🔇' : '🔊';
        this.btnSound.title = this.isMuted ? 'Unmute Sound' : 'Mute Sound';
    }
}

/**
 * Lightweight Canvas Confetti Particles
 */
const ConfettiCelebration = {
    canvas: null,
    ctx: null,
    particles: [],
    animationId: null,

    init() {
        this.canvas = document.getElementById('confetti-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    },

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    start() {
        if (!this.canvas) this.init();
        this.resize();
        this.particles = [];
        const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#38bdf8', '#a855f7'];

        for (let i = 0; i < 90; i++) {
            this.particles.push({
                x: window.innerWidth * 0.5,
                y: window.innerHeight * 0.4,
                w: Math.random() * 8 + 6,
                h: Math.random() * 6 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                vx: (Math.random() - 0.5) * 16,
                vy: (Math.random() - 0.8) * 18,
                rotation: Math.random() * 360,
                vRot: (Math.random() - 0.5) * 10,
                gravity: 0.35,
                opacity: 1
            });
        }

        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.loop();
    },

    loop() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        let activeParticles = 0;
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.rotation += p.vRot;
            p.opacity -= 0.007;

            if (p.opacity > 0 && p.y < this.canvas.height + 50) {
                activeParticles++;
                this.ctx.save();
                this.ctx.globalAlpha = Math.max(0, p.opacity);
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate((p.rotation * Math.PI) / 180);
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                this.ctx.restore();
            }
        });

        if (activeParticles > 0) {
            this.animationId = requestAnimationFrame(() => this.loop());
        } else {
            this.stop();
        }
    },

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
};

// Start Game on Page Load
window.addEventListener('DOMContentLoaded', () => {
    new HangmanGame();
});
