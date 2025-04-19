/**
 * A custom HTML element that represents a countdown timer.
 *
 * The CountdownTimer component initializes with a shadow DOM, sets the initial time left to 0,
 * and initializes the interval ID and total time spent. It listens for 'set-question' and 'stop-timer'
 * events to start and stop the timer respectively. The timer display is updated every second and
 * dispatches a 'total-time-spent' event when the timer reaches zero.
 *
 * @class
 * @augments HTMLElement
 * @property {number} timeLeft - The remaining time in seconds.
 * @property {number} totalTimeSpent - The total time spent in seconds.
 * @property {number|null} intervalId - The ID of the interval timer.
 * @function connectedCallback - Called when the element is added to the DOM. Sets up event listeners.
 * @function render - Renders the countdown timer component.
 * @function startTimer - Starts a countdown timer with the specified duration.
 * @function getTotalTimeSpent - Calculates the total time spent and dispatches a custom event with the total time.
 * @function resetTotalTimeSpent - Resets the total time spent to zero.
 * @function updateDisplay - Updates the display of the countdown timer.
 * @function stopTimer - Stops the countdown timer by clearing the interval.
 */
class CountdownTimer extends HTMLElement {
  /**
   * Creates an instance of the countdown timer component.
   * Initializes the shadow DOM, sets the initial time left to 0,
   * and initializes the interval ID and total time spent.
   */
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this.timeLeft = 0
    this.intervalId = null
    this.totalTimeSpent = 0
    this.accumulatedTime = 0
  }

  /**
   * Called when the element is added to the DOM.
   * Sets up event listeners for 'set-question' and 'stop-timer' events.
   *
   * @listens window#set-question
   * @listens window#stop-timer
   */
  connectedCallback () {
    this.render()
    window.addEventListener('set-question', (event) => {
      const { duration } = event.detail
      this.startTimer(duration)
    })
    window.addEventListener('stop-timer', () => {
      this.stopTimer()
    })

    window.addEventListener('try-again', () => {
      this.resetAll()
    })
  }

  /**
   * Renders the countdown timer component.
   *
   * This method updates the shadow DOM of the component with the timer display.
   * The timer display includes styles for padding, border-radius, font-size,
   * text alignment, background color, text color, border, and box shadow.
   * The timer display shows the remaining time in seconds.
   */
  render () {
    this.shadowRoot.innerHTML = `
      <style>
        #timer-display {
        padding: 10px;
        border-radius: 5px;
        font-size: 1.2rem;
        text-align: center;
        background-color: #fff3cd;
        color: #856404;
        border: 1px solid #ffeeba;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        max-width: 200px;
        margin: 10px auto;
      }
      </style>
      <div class="timer hidden" id="timer-display">
          Time Left: ${this.timeLeft}s
      </div>
    `
  }

  /**
   * Starts a countdown timer with the specified duration.
   * If the duration is invalid, a default of 20 seconds is used.
   * Updates the display every second and dispatches a 'total-time-spent' event when the timer reaches zero.
   *
   * @param {number} duration - The duration of the timer in seconds.
   */
  startTimer (duration) {
    if (typeof duration !== 'number' || isNaN(duration)) {
      console.error('Invalid duration value, using default of 20 seconds')
      duration = 20
    }

    this.stopTimer() // Stop the timer if it is running
    this.timeLeft = duration // Assign duration to timeLeft
    this.updateDisplay()

    this.intervalId = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft -= 1
        this.totalTimeSpent += 1
        this.updateDisplay()
      } else {
        this.stopTimer()
        this.dispatchTotalTimeSpentEvent()
      }
    }, 1000)
  }

  /**
   * Stops the countdown timer by clearing the interval.
   * If the timer is running, it will clear the interval and set the intervalId to null.
   */
  stopTimer () {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      this.accumulatedTime += this.totalTimeSpent
      console.log(`Timer Stopped. Total Time Spent: ${this.totalTimeSpent}`)
      console.log(`Accumulated Time: ${this.accumulatedTime}`)

      this.totalTimeSpent = 0
    }
  }

  /**
   * Accumulates the total time spent into the accumulated time.
   * Logs the accumulated time to the console.
   * Resets the total time spent.
   */
  accumulateTime () {
    this.resetTotalTimeSpent()
    this.accumulatedTime += this.totalTimeSpent
    console.log(`Accumulated Time: ${this.accumulatedTime}`)
  }

  /**
   * Dispatches a custom event 'total-time-spent' with the total accumulated time.
   * The event bubbles up through the DOM and is composed.
   *
   * @fires CustomEvent#total-time-spent
   * @property {number} detail.totalTime - The total accumulated time.
   */
  dispatchTotalTimeSpentEvent () {
    this.dispatchEvent(new CustomEvent('total-time-spent', {
      detail: {
        totalTime: this.accumulatedTime
      },
      bubbles: true,
      composed: true
    }))
  }

  /**
   * Calculates the total time spent and dispatches a custom event with the total time.
   * If there is time left, it adds the remaining time to the total time spent.
   * Dispatches a 'total-time-spent' event with the total time spent as detail.
   */
  getTotalTimeSpent () {
    if (this.timeLeft > 0) {
      this.totalTimeSpent += this.timeLeft
    }

    this.dispatchEvent(new CustomEvent('total-time-spent', {
      detail: {
        totalTime: this.totalTimeSpent
      },
      bubbles: true,
      composed: true
    }))
  }

  /**
   * Resets the total time spent to zero.
   */
  resetTotalTimeSpent () {
    this.totalTimeSpent = 0
  }

  /**
   * Resets the total time spent to zero.
   */
  resetAccumulatedTime () {
    this.accumulatedTime = 0
  }

  /**
   * Resets all timer-related properties and updates the display.
   * Stops the timer, resets the total time spent and accumulated time, and updates the display.
   */
  resetAll () {
    this.stopTimer()
    this.resetTotalTimeSpent()
    this.resetAccumulatedTime()
    this.updateDisplay()
  }

  /**
   * Updates the display of the countdown timer.
   *
   * This method selects the element with the ID 'timer-display' from the shadow DOM
   * and updates its text content to show the remaining time in seconds.
   */
  updateDisplay () {
    const timerDisplay = this.shadowRoot.querySelector('#timer-display')
    if (timerDisplay) {
      timerDisplay.textContent = `Time Left: ${this.timeLeft} s`
    }
  }
}
customElements.define('countdown-timer', CountdownTimer)
