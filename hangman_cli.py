
import random
import time

# ==========================================
#          HANGMAN GAME IN PYTHON
# ==========================================

word_categories = {
    "Animals": [
        "elephant", "tiger", "giraffe", "kangaroo",
        "dolphin", "crocodile", "penguin", "cheetah"
    ],
    "Programming": [
        "python", "computer", "keyboard", "variable",
        "function", "algorithm", "database", "internet"
    ],
    "Countries": [
        "india", "japan", "canada", "brazil",
        "australia", "germany", "france", "italy"
    ],
    "Food": [
        "pizza", "burger", "sandwich", "chocolate",
        "pancake", "noodles", "biryani", "popcorn"
    ]
}

# Hangman drawings: 6 incorrect guesses maximum
hangman_art = [
    """
       +---+
       |   |
           |
           |
           |
           |
    =========
    """,
    """
       +---+
       |   |
       O   |
           |
           |
           |
    =========
    """,
    """
       +---+
       |   |
       O   |
       |   |
           |
           |
    =========
    """,
    """
       +---+
       |   |
       O   |
      /|   |
           |
           |
    =========
    """,
    """
       +---+
       |   |
       O   |
      /|\\  |
           |
           |
    =========
    """,
    """
       +---+
       |   |
       O   |
      /|\\  |
      /    |
           |
    =========
    """,
    """
       +---+
       |   |
       O   |
      /|\\  |
      / \\  |
           |
    =========
    """
]


def print_line():
    print("-" * 45)


def show_title():
    print("\n" + "=" * 45)
    print("          WELCOME TO HANGMAN")
    print("=" * 45)
    print("Guess the hidden word one letter at a time!")
    print("Every incorrect guess costs one life.")
    print_line()


def choose_difficulty():
    print("\nChoose your difficulty:")
    print("1. Easy   - 8 lives")
    print("2. Medium - 6 lives")
    print("3. Hard   - 4 lives")

    while True:
        choice = input("Enter your choice (1-3): ").strip()

        if choice == "1":
            return 8
        elif choice == "2":
            return 6
        elif choice == "3":
            return 4
        else:
            print("Invalid choice. Enter 1, 2, or 3.")


def choose_category():
    categories = list(word_categories.keys())

    print("\nChoose a category:")

    for index, category in enumerate(categories, start=1):
        print(f"{index}. {category}")

    print(f"{len(categories) + 1}. Random category")

    while True:
        choice = input("Enter your choice: ").strip()

        if choice.isdigit():
            number = int(choice)

            if 1 <= number <= len(categories):
                return categories[number - 1]

            if number == len(categories) + 1:
                return random.choice(categories)

        print("Invalid category. Try again.")


def choose_word(category):
    return random.choice(word_categories[category]).lower()


def display_word(word, guessed_letters):
    displayed = [
        letter.upper() if letter in guessed_letters else "_"
        for letter in word
    ]

    print("\nHidden word: " + " ".join(displayed))


def display_game_status(
    word, guessed_letters, wrong_guesses, lives, score
):
    print_line()
    print(f"Lives remaining: {lives}")
    print(f"Wrong guesses: {wrong_guesses}")
    print(f"Current score: {score}")

    display_word(word, guessed_letters)

    print(
        "Guessed letters:",
        ", ".join(sorted(guessed_letters))
        if guessed_letters else "None"
    )

    print_line()


def give_hint(word, guessed_letters):
    hidden_letters = list(
        set(word) - guessed_letters
    )

    if not hidden_letters:
        print("There are no letters left to reveal!")
        return None

    hint_letter = random.choice(hidden_letters)

    print(
        f"\nHINT: The word contains "
        f"the letter '{hint_letter.upper()}'."
    )

    return hint_letter


def calculate_score(word, lives, hints_used):
    base_points = len(word) * 10
    bonus_points = lives * 5
    hint_penalty = hints_used * 5

    return max(0, base_points + bonus_points - hint_penalty)


def play_round(total_score):
    lives = choose_difficulty()
    category = choose_category()
    word = choose_word(category)

    guessed_letters = set()
    wrong_guesses = 0
    hints_used = 0

    print("\nPreparing your game...")
    time.sleep(1)

    print(f"\nCategory: {category}")
    print(f"The word has {len(word)} letters.")
    print("Type 'hint' to reveal a letter.")
    print("Type 'quit' to leave the round.")

    while lives > 0:
        # Select the drawing based on incorrect guesses.
        art_index = min(
            wrong_guesses, len(hangman_art) - 1
        )
        print(hangman_art[art_index])

        display_game_status(
            word,
            guessed_letters,
            wrong_guesses,
            lives,
            total_score
        )

        # Check for a win before requesting another guess.
        if all(letter in guessed_letters for letter in word):
            round_score = calculate_score(
                word, lives, hints_used
            )

            print("\nCONGRATULATIONS! YOU WON!")
            print(f"The word was: {word.upper()}")
            print(f"Points earned this round: {round_score}")

            return total_score + round_score, True

        guess = input(
            "Guess a letter, 'hint', or 'quit': "
        ).strip().lower()

        if guess == "quit":
            print(f"\nYou left the round. The word was {word.upper()}.")
            return total_score, False

        if guess == "hint":
            hint_letter = give_hint(word, guessed_letters)

            if hint_letter is not None:
                guessed_letters.add(hint_letter)
                hints_used += 1

            continue

        # Accept exactly one English alphabetic letter.
        if len(guess) != 1 or guess not in "abcdefghijklmnopqrstuvwxyz":
            print("Please enter one letter from A to Z.")
            continue

        if guess in guessed_letters:
            print("You already guessed that letter. Try another.")
            continue

        guessed_letters.add(guess)

        if guess in word:
            print(f"Correct! '{guess.upper()}' is in the word.")
        else:
            lives -= 1
            wrong_guesses += 1
            print(f"Wrong! '{guess.upper()}' is not in the word.")

    # Game over
    print(hangman_art[-1])
    print("\nGAME OVER!")
    print(f"The correct word was: {word.upper()}")
    print("You ran out of lives.")

    return total_score, False


def show_final_results(total_score, rounds_played, rounds_won):
    print("\n" + "=" * 45)
    print("             FINAL RESULTS")
    print("=" * 45)

    print(f"Rounds played : {rounds_played}")
    print(f"Rounds won    : {rounds_won}")
    print(f"Total score   : {total_score}")

    if rounds_played > 0:
        win_percentage = rounds_won / rounds_played * 100
        print(f"Win percentage: {win_percentage:.1f}%")

    if rounds_played > 0 and rounds_won == rounds_played:
        print("\nExcellent! You won every round!")
    elif rounds_won > 0:
        print("\nGood job! Keep practicing your vocabulary.")
    else:
        print("\nBetter luck next time!")

    print("=" * 45)


def main():
    total_score = 0
    rounds_played = 0
    rounds_won = 0

    show_title()

    player_name = input("Enter your player name: ").strip()

    if not player_name:
        player_name = "Player"

    print(f"\nHello, {player_name}! Let's start playing.")

    while True:
        print("\nMAIN MENU")
        print("1. Play Hangman")
        print("2. View instructions")
        print("3. View score")
        print("4. Exit game")

        choice = input("Choose an option (1-4): ").strip()

        if choice == "1":
            score_before_round = total_score

            total_score, won = play_round(total_score)
            rounds_played += 1

            if won:
                rounds_won += 1

            print(f"\nWell played, {player_name}!")
            print(f"Score before round: {score_before_round}")
            print(f"Total score now: {total_score}")

        elif choice == "2":
            print("\nHOW TO PLAY")
            print("1. Select a difficulty level.")
            print("2. Select a word category.")
            print("3. Guess one letter at a time.")
            print("4. Correct guesses reveal letters.")
            print("5. Wrong guesses reduce your lives.")
            print("6. Type 'hint' to reveal a letter (costs 5 points).")
            print("7. Type 'quit' to leave the current round.")
            print("8. Reveal the entire word before you run out of lives.")
            print("9. Earn points for winning rounds.")

        elif choice == "3":
            print("\nCURRENT SCORE")
            print(f"Player        : {player_name}")
            print(f"Rounds played : {rounds_played}")
            print(f"Rounds won    : {rounds_won}")
            print(f"Total points  : {total_score}")

        elif choice == "4":
            print("\nThanks for playing Hangman!")
            show_final_results(
                total_score, rounds_played, rounds_won
            )
            break

        else:
            print("Invalid option. Select 1, 2, 3, or 4.")


if __name__ == "__main__":
    try:
        main()
    except (EOFError, KeyboardInterrupt):
        print("\n\nGame closed. Thanks for playing!")