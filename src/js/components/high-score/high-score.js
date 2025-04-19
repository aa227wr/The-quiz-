/**
 * Represents a high score component that displays and manages high scores.
 * This component uses the shadow DOM and interacts with localStorage to persist high scores.
 *
 * @class highScore
 * @augments {HTMLElement}
 * @property {Array<object>} score - An array to store high score entries.
 * @function connectedCallback - Called when the element is added to the document's DOM. Initializes high scores from localStorage and sets up an event listener for the 'high-score' event.
 * @function render - Renders the high score list and a "Try Again" button. Updates the shadow DOM with the generated HTML.
 * @function tryAgain - Handles the "try again" action by removing the high score event listener and dispatching a custom "try-again" event.
 */
class highScore extends HTMLElement {
  /**
   * Creates an instance of the HighScore component.
   * Initializes the shadow DOM and sets up an empty score array.
   */
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this.score = []
  }

  /**
   * Called when the element is added to the document's DOM.
   * Initializes the high scores from localStorage and sets up an event listener
   * for the 'high-score' event to update the high scores.
   *
   * - Retrieves high scores from localStorage and parses them as JSON.
   * - Ensures the high scores are stored as an array.
   * - Renders the high scores.
   * - Adds an event listener for the 'high-score' event to update the high scores.
   * - Prevents saving duplicate entries (same nickname and score).
   * - Adds new high score entries and keeps only the top 5 scores.
   * - Sorts the high scores in ascending order.
   * - Saves the updated high scores to localStorage.
   * - Renders the updated high scores.
   */
  connectedCallback () {
    this.scores = JSON.parse(localStorage.getItem('highScores')) || []
    this.scores = []

    this.render()

    window.addEventListener('high-score', (event) => {
      // Prevent saving duplicates (same nickname and same score)
      const existingEntry = this.scores.find(score => score.nickname === event.detail.nickname && score.score === event.detail.score)
      if (!existingEntry) {
        this.scores.push({
          nickname: event.detail.nickname,
          score: event.detail.score
        })

        localStorage.setItem('highScores', JSON.stringify(this.scores))
        this.render()
      }
    })
  }

  /**
   * Renders the high score list and a "Try Again" button.
   *
   * This method retrieves the high scores from local storage, filters and maps them into a list of HTML elements,
   * and then updates the shadow DOM with the generated HTML. It also adds an event listener to the "Try Again" button
   * to call the `tryAgain` method when clicked.
   *
   * @function render
   */
  render () {
    this.scores = JSON.parse(localStorage.getItem('highScores')) || []

    const topFiveScores = this.scores
      .filter(entry => entry && typeof entry.score === 'number' && !isNaN(entry.score))
      .sort((a, b) => a.score - b.score)
      .slice(0, 5)

    const scoreList = topFiveScores.map((entry, index) => `
    <li>
      <span class="nickname">${index + 1}. ${entry.nickname}</span>
      <span class="score">${entry.score}</span>
    </li>
    `).join('')

    this.shadowRoot.innerHTML = `
      <style>
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      li {
        display: flex;
        justify-content: space-evenly;
        padding: 10px;
        margin: 8px 0;
        background-color: #f8f9fa;
        border-radius: 5px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      h2 {
        text-align: center;
        font-size: 1.5rem;
        color: #333;
        margin-bottom: 15px;
      }

      .nickname {
        font-weight: 500;
        color: #333;
      }

      .score {
        font-weight: bold;
        color: #007bff;
      }
        #try-again-button {
          display: block;
          margin: 20px auto;
          padding: 10px 20px;
          background-color: #28a745;
          color: #ffffff;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1rem;
          text-align: center;
          transition: background-color 0.3s ease;
        }

        #try-again-button:hover {
          background-color: #218838;
        }
    </style>
      <h2>High Score</h2>
      <ul>${scoreList}</ul>
      <button id="try-again-button">Try Again</button>
    `
    this.shadowRoot.querySelector('#try-again-button').addEventListener('click', () => {
      this.tryAgain()
    })
  }

  /**
   * Handles the "try again" action by removing the high score event listener
   * and dispatching a custom "try-again" event.
   *
   * @fires CustomEvent#try-again - Dispatched when the user wants to try again.
   */
  tryAgain () {
    window.removeEventListener('high-score', this.highScoreListener)

    this.dispatchEvent(new CustomEvent('try-again', {
      bubbles: true,
      composed: true
    }))
  }
}

customElements.define('high-score', highScore)
