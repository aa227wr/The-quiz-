import '../high-score/high-score.js'
import '../nickname-form/nickname-form.js'
import '../quiz-question/quiz-question.js'
import '../countdown-timer/countdown-timer.js'

/**
 * Represents the Quiz Application component.
 *
 * @augments HTMLElement
 */
class QuizApplication extends HTMLElement {
  /**
   * Creates an instance of the QuizApplication component.
   * Initializes the shadow DOM, score, high scores, timer interval, and timeout action flag.
   */
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this.score = 0
    this.highScores = JSON.parse(localStorage.getItem('highScores')) || []
    this.timerInterval = null
    this.allowTimeoutAction = true
  }

  /**
   * Called when the element is inserted into the DOM.
   * Initializes the component by rendering it and setting up event listeners.
   *
   * @function connectedCallback
   * Listens for the 'try-again' event on the highScore element to restart the quiz.
   * Listens for the 'disconnect' event on the window to remove the highScoreListener.
   * Listens for the 'total-time-spent' event on the countdownTimer element to update the total time spent and show the high score.
   */
  connectedCallback () {
    this.render()
    this.initializeComponents()

    this.highScore.addEventListener('try-again', () => {
      this.restartQuiz()
    })

    window.addEventListener('disconnect', () => {
      window.removeEventListener('high-score', this.highScoreListener)
    })

    this.countdownTimer.addEventListener('total-time-spent', (event) => {
      const accumulatedTime = event.detail.totalTime
      this.totalTime = accumulatedTime
      this.showHighScore(this.totalTime)
    })
  }

  /**
   * Renders the quiz application components into the shadow DOM.
   *
   * The rendered components include:
   * - nickname-form: A form for entering the user's nickname.
   * - quiz-question: The quiz question component.
   * - countdown-timer: A timer for the quiz.
   * - high-score: A component displaying the high scores.
   *
   * The method also includes a style block to hide elements with the class 'hidden'.
   */
  render () {
    this.shadowRoot.innerHTML = `
        <style>
            .hidden {
                display: none;
            } 
        </style>
        <nickname-form></nickname-form>
        <quiz-question></quiz-question>
        <countdown-timer></countdown-timer>
        <high-score></high-score>
    `
  }

  /**
   * Initializes the components of the quiz application.
   *
   * - Sets up references to the nickname form, quiz question, high score, and countdown timer components.
   * - Adds event listeners for nickname submission, timeout, answer selection, and quiz completion.
   * - Manages the visibility of components based on user interactions.
   * - Fetches the first quiz question upon nickname submission.
   *
   * @async
   * @function initializeComponents
   */
  initializeComponents () {
    this.nicknameForm = this.shadowRoot.querySelector('nickname-form')
    this.quizQuestion = this.shadowRoot.querySelector('quiz-question')
    this.highScore = this.shadowRoot.querySelector('high-score')
    this.countdownTimer = this.shadowRoot.querySelector('countdown-timer')

    this.highScore.classList.add('hidden')
    this.countdownTimer.classList.add('hidden')

    this.nicknameForm.addEventListener('nickname', async (event) => {
      const nickname = event.detail.nickname

      this.nicknameForm.classList.add('hidden')
      this.quizQuestion.classList.remove('hidden')
      this.countdownTimer.classList.remove('hidden')

      this.nickname = nickname
      localStorage.setItem('nickname', nickname)
      this.score = 0

      await this.fetchQuestions('https://courselab.lnu.se/quiz/question/1')
    })

    this.countdownTimer.addEventListener('timeout', () => {
      if (this.allowTimeoutAction) {
        const accumulatedTime = this.countdownTimer.accumulatedTime
        this.showHighScore(accumulatedTime)
      }
    })

    this.quizQuestion.addEventListener('answer-selected', async (event) => {
      const selectedAnswer = event.detail.selectedAnswer
      await this.submitAnswer(selectedAnswer)
    })

    this.quizQuestion.addEventListener('quiz-completed', (event) => {
      const accumulatedTime = event.detail.accumulatedTime
      this.showHighScore(accumulatedTime)
    })
  }

  /**
   * Submits the selected answer to the server and handles the response.
   *
   * @async
   * @function submitAnswer
   * @param {string} answer - The selected answer to be submitted.
   */
  async submitAnswer (answer) {
    try {
      const response = await fetch(this.currentQuestion.nextURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answer })
      })

      const data = await response.json()

      if (data && data.nextURL) {
        try {
          await this.fetchNextQuestion(data.nextURL)
        } catch (error) {
          console.error(error)
        }
      } else {
        this.countdownTimer.stopTimer()
        this.showHighScore(this.countdownTimer.accumulatedTime)
      }
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Fetches quiz questions from the provided URL and dispatches a custom event with the question data.
   *
   * @param {string} url - The URL to fetch the quiz questions from.
   * @returns {Promise<void>} A promise that resolves when the questions have been fetched and the event has been dispatched.
   * @throws Will throw an error if the fetch operation fails.
   */
  async fetchQuestions (url) {
    try {
      const response = await fetch(url)
      const data = await response.json()

      this.currentQuestion = data

      const duration = data.limit ? parseInt(data.limit) : 20
      this.dispatchEvent(new CustomEvent('set-question', {
        detail: {
          question: this.currentQuestion,
          duration
        },
        bubbles: true,
        composed: true
      }))
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Fetches the next quiz question from the provided URL.
   *
   * @param {string} url - The URL to fetch the next question from.
   * @returns {Promise<void>} - A promise that resolves when the question is fetched and set.
   * @throws {Error} - Throws an error if the fetch operation fails.
   */
  async fetchNextQuestion (url) {
    try {
      const response = await fetch(url)

      const data = await response.json()
      this.currentQuestion = data

      const duration = parseInt(this.currentQuestion.limit) || 20

      // Endast sätt frågan och starta timern när frågan är hämtad och valid
      if (this.currentQuestion) {
        this.dispatchEvent(new CustomEvent('set-question', {
          detail: {
            question: this.currentQuestion,
            duration
          },
          bubbles: true,
          composed: true
        }))
      }
    } catch (error) {
      console.error(error)
      this.showHighScore(this.totalTime)
    }
  }

  /**
   * Handles the timeout event by stopping the timer and showing the high score.
   */
  handleTimeout () {
    this.countdownTimer.stopTimer()
    const accumulatedTime = this.countdownTimer.accumulatedTime || this.countdownTimer.accumulatedTime
    console.log(`Timeout occurred. Total Time Spent: ${accumulatedTime}`)
    this.showHighScore(this.countdownTimer.accumulatedTime)
  }

  /**
   * Displays the high score and saves it to local storage if it is a new entry.
   *
   * @param {number} accumulatedTime   - The total time spent on the quiz.
   * @returns {void}
   */
  showHighScore (accumulatedTime) {
    if (this.highScoreShown) return

    window.dispatchEvent(new CustomEvent('stop-timer', {
      bubbles: true,
      composed: true
    }))

    this.highScoreShown = true

    this.quizQuestion.classList.add('hidden')
    this.countdownTimer.classList.add('hidden')
    this.nicknameForm.classList.add('hidden')

    // Save the high score in local storage
    const newHighScore = {
      nickname: this.nickname,
      score: accumulatedTime
    }

    const highScores = JSON.parse(localStorage.getItem('highScores')) || []

    if (newHighScore.nickname.trim() !== '') {
      // Check if entry already exists (avoid duplicates)
      const existingEntryIndex = highScores.findIndex(
        (score) =>
          score.nickname === newHighScore.nickname &&
          score.score === newHighScore.score
      )

      if (existingEntryIndex === -1) {
        // Add the new high score to the list
        highScores.push(newHighScore)

        // Sort the high scores in ascending order
        highScores.sort((a, b) => a.score - b.score)

        // Save all high scores to local storage
        localStorage.setItem('highScores', JSON.stringify(highScores))

        // Dispatch an event to update the high-score component
        window.dispatchEvent(
          new CustomEvent('high-score', {
            detail: {
              nickname: newHighScore.nickname,
              score: newHighScore.score
            }
          })
        )
      }
    }
    this.highScore.classList.remove('hidden')
  }

  /**
   * Restarts the quiz by resetting the score, current question index, and clearing stored data.
   * Hides the high score and quiz question elements, shows the nickname form, and resets the countdown timer.
   * Dispatches a 'stop-timer' event and removes the 'high-score' event listener.
   */
  restartQuiz () {
    window.dispatchEvent(new CustomEvent('stop-timer', {
      bubbles: true,
      composed: true
    }))

    this.countdownTimer.resetAll()

    this.highScore.classList.add('hidden')
    this.currentQuestionIndex = 0
    this.score = 0
    localStorage.removeItem('quizScore')
    localStorage.removeItem('nickname')

    window.removeEventListener('high-score', this.showHighScore)

    const nicknameInput = this.nicknameForm.shadowRoot.querySelector('input[type="text"]')
    if (nicknameInput) { nicknameInput.value = '' } // Clear the nickname input field

    this.quizQuestion.classList.add('hidden')
    this.countdownTimer.classList.add('hidden')
    this.nicknameForm.classList.remove('hidden')
    this.highScoreShown = false
  }
}

customElements.define('quiz-application', QuizApplication)
