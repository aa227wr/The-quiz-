# 🧠 The Quiz

This is a quiz application built as a Single Page Application (SPA), where the user answers questions delivered from a RESTful web API. The application handles time constraints, feedback on correct/incorrect answers, and displays a high-score list based on total response time. It was developed as a school assignment to demonstrate knowledge in asynchronous communication, RESTful APIs, and client-side application architecture using vanilla JavaScript.

## 🚀 Features

- RESTful communication with an external quiz API
- Timed questions (20 seconds per question)
- End-game on incorrect answer or timeout
- Final score based on total response time
- High score list (top 5) stored in browser Web Storage
- Clean and user-friendly interface
- Responsive single-page design using vanilla JavaScript

## 🎮 How It Works

1. The user starts the game by entering a nickname.
2. A question is fetched from the API (`https://courselab.lnu.se/quiz/question/1`).
3. The application determines if the question is text-based or multiple choice.
4. The user answers within 20 seconds, or the game ends.
5. If the answer is correct, the next question is fetched via a new API link.
6. If the quiz is completed, the total time is saved in the high-score list.

## 🛠️ Technologies

- HTML5, CSS3
- Vanilla JavaScript (no frameworks)
- Fetch API for asynchronous HTTP communication
- Web Storage API for storing high scores locally
- Fully RESTful client behavior
