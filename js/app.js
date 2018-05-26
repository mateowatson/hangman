var hmBoard = {
	template: `
		<div class="hangman__board">
			<h2 class="sr-only">Board</h2>

			<div class="hangman__noose">
				<div class="hangman__top-bar"></div>
				<div class="hangman__side-bar"></div>
				<div class="hangman__bottom-bar"></div>
				<div class="hangman__bottom-front-bar"></div>
				<div class="hangman__rope"></div>
				<div class="hangman__body" v-show="numberGuessesMade >= 2"></div>
				<div class="hangman__neck-rope"></div>
				<div class="hangman__head" v-show="numberGuessesMade >= 1"></div>
				<div class="hangman__left-leg" v-show="numberGuessesMade >= 3"></div>
				<div class="hangman__right-leg" v-show="numberGuessesMade >= 4"></div>
				<div class="hangman__left-arm" v-show="numberGuessesMade >= 5"></div>
				<div class="hangman__right-arm" v-show="numberGuessesMade >= 6"></div>
			</div>
			
			<div class="hangman__in-game-view" v-show="gameStatus === 'On'">
				<div class="hangman__phrase">
					<span v-for="word in words" class="hangman__word">
						<span v-for="letter in word" class="hangman__char" :class="makeLetterClass(letter)">{{ letter }}</span>
						<span class="hangman__char hangman__space"></span>
					</span>
				</div>

				<div class="hangman__guess-dialog">
					<p>Guess one letter...</p>
					<input type="text" class="hangman__guess" v-model="guess" />
					<button class="btn hangman__btn" @click="makeGuess">Guess</button>
				</div>

				<div class="hangman__letters-guessed-wrapper">
					<p class="hangman__letters-guessed-label">Letters used:</p>
					<p class="hangman__letters-guessed"><span class="hangman__letter-guessed" v-for="letter in lettersGuessedTotal">{{ letter }}<span class="hangman__letter-spacer">, </span></span></p>
				</div>
			</div>
			
			<div class="hangman__end-dialog" v-show="endGameDialog">
				<p class="hangman__end-dialog-message">{{ endGameDialog }}</p>
				<button class="btn hangman__btn-primary" @click="reset">Play Again!</button>
				<a href="/" class="btn hangman__btn">Go Back to the Home Screen</a>
			</div>

			<div class="hangman__begin-dialog" v-show="gameStatus === 'Pre-Game'">
				<p>Type in the word for your opponent to guess.</p>
				<input type="text" class="hangman__input-phrase" v-model="phrase" />
				<button class="btn hangman__btn" @click="beginBtnHandler">Begin</button>
			</div>
			
		</div>
	`,

	data: function() {
		return {
			gameStatus: 'Pre-Game',
			phrase: '',
			words: [],
			letters: [],
			lettersGuessed: [],
			lettersGuessedWrong: [],
			guess: '',
			numberGuesses: 6,
			numberGuessesMade: 0
		}
	},

	computed: {
		endGameDialog: function() {
			if (this.gameStatus === 'You Won!') {
				return 'You Won!';
			}

			if (this.gameStatus === 'You Lost') {
				return 'You Lost';
			}

			return false;
		},

		lettersGuessedTotal: function() {
			var data = [];
			var lettersGuessedWrong = [];
			var lettersGuessed = [];

			this.lettersGuessedWrong.forEach(function(letter, index) {
				if (letter !== ' ' && letter !== '\'' && letter !== '"' && letter !== '-') {
					data.push(letter);
				}
			});

			this.lettersGuessed.forEach(function(letter, index) {
				data.push(letter);
			});

			data.sort();

			var compressedData = data.filter(function(el, ind, arr) {
				return el !== arr[ind + 1];
			});

			return compressedData;
		}
	},

	methods: {
		makeGuess: function() {
			var self = this;
			var guess = this.guess.toLowerCase();

			if (guess.length < 1) return;
			if (guess.length > 1) return;
			if (guess === '"') return;
			if (guess === '\'') return;
			if (guess === '-') return;
			if (this.lettersGuessed.includes(guess)) return;
			if (this.lettersGuessedWrong.includes(guess)) return;


			if (!this.letters.includes(guess)) {
				this.numberGuessesMade++;
				this.lettersGuessedWrong.push(guess);
			} else {
				this.letters.forEach(function(letter, index) {
					if (guess === letter) {
						self.lettersGuessed.push(guess);
					}
				});
			}

			this.guess = '';

			if (this.checkWin()) {
				this.gameStatus = 'You Won!';
			} else if (this.numberGuessesMade >= this.numberGuesses) {
				this.gameStatus = 'You Lost';
			}
		},

		checkWin: function() {
			var self = this;
			
			var letters = [];
			var lettersGuessed = [];

			self.letters.forEach(function(letter, index) {
				if (letter !== ' ' && letter !== '\'' && letter !== '"' && letter !== '-') {
					letters.push(letter);
				}
			});

			self.lettersGuessed.forEach(function(letter, index) {
				lettersGuessed.push(letter);
			});

			letters.sort();

			lettersGuessed.sort();

			var compressedLetters = letters.filter(function(el, ind, arr) {
				return el !== arr[ind + 1];
			});

			var compressedLettersGuessed = lettersGuessed.filter(function(el, ind, arr) {
				return el !== arr[ind + 1];
			});

			var winCounter = 0;

			for (var i = 0; i < compressedLetters.length; i++) {
				if (compressedLetters[i] === compressedLettersGuessed[i]) {
					winCounter++;
				}
			}

			if (winCounter === compressedLetters.length) {
				return true;
			}
		},

		makeLetterClass: function(letter) {
			var letterClass = '';

			if (this.lettersGuessed.includes(letter)) {
				letterClass += 'hangman__char_revealed ';
			}

			if (letter === ' ') {
				return letterClass += 'hangman__space';
			} else if (letter === '\'' || letter === '-' || letter === '"') {
				return letterClass += 'hangman__special-char';
			} else {
				return letterClass += 'hangman__letter';
			}
		},

		beginBtnHandler: function() {
			this.createWords();
			this.createLetters();
			this.gameStatus = 'On';
		},

		createLetters: function() {
			var phrase = this.phrase.toLowerCase();
			this.letters = phrase.split('');
		},

		createWords: function() {
			var phrase = this.phrase.toLowerCase();
			var words = phrase.split(' ');
			words.forEach(function(word, index, arr) {
				arr[index] = word.split('');
			});
			console.log(words);
			this.words = words;
		},

		reset: function() {
			this.phrase = '';
			this.words = [];
			this.letters = [];
			this.lettersGuessed = [];
			this.lettersGuessedWrong = [];
			this.guess = '';
			this.numberGuesses = 6;
			this.numberGuessesMade = 0;
			this.gameStatus = 'Pre-Game';
		},
	}
};

var Hangman = {
	template: `
		<div class="hangman">
			<h1 class="hangman__heading1 game99__game-title">Hangman</h1>
			
			<div class="hangman__board-wrapper">
				<hm-board></hm-board>
			</div>
		</div>
	`,

	components: {
		hmBoard: hmBoard
	}
};

var app = new Vue({
	el: '#app',

	components: {
		hangman: Hangman
	},
});
