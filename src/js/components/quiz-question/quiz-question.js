/**
 * Represents a quiz question component.
 * This component is a custom HTML element that displays a quiz question and its possible answers.
 * It supports both multiple-choice questions and text input questions.
 *
 * @class
 * @augments HTMLElement
 * @property {number} score - The current score of the quiz.
 * @property {object | null} currentQuestion - The current question being displayed.
 * @function connectedCallback - Called when the element is added to the DOM. Sets up event listeners and renders the initial state.
 * @function render - Renders the HTML structure and styles for the component.
 * @function setQuestion - Sets the current question and updates the display with the question and its options.
 * @param {object} question - The question object containing the question text and possible answers.
 * @function validateQuestionFormat - Validates the format of the question object.
 * @param {object} question - The question object to validate.
 * @returns {boolean} - Returns true if the question format is valid, false otherwise.
 * @function renderQuestion - Renders the current question and its options.
 * @function handleAnswerClick - Handles the click event when an answer is selected.
 * @param {Event} event - The event object from the click event.
 * @function handleTextAnswer - Handles the submission of a text answer.
 */
class QuizQuestion extends HTMLElement {
  /**
   * Creates an instance of the QuizQuestion component.
   * Initializes the shadow DOM, score, and current question.
   */
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this.score = 0
    this.currentQuestion = null
  }

  /**
   * Called when the element is added to the DOM.
   * Sets up the initial rendering of the component and adds an event listener for the 'set-question' event.
   * When the 'set-question' event is triggered, it extracts the question from the event detail and calls the setQuestion method with the question.
   */
  connectedCallback () {
    this.render()
    window.addEventListener('set-question', (event) => {
      const { question } = event.detail
      this.setQuestion(question)
    })
  }

  /**
   * Renders the quiz question component by setting the inner HTML of the shadow DOM.
   * The component includes styles for the question container, options container,
   * buttons, input container, and form elements.
   *
   * The styles include:
   * - Centered text and rounded corners for the question container.
   * - Flexbox layout for the options container and input container.
   * - Styled buttons with hover and active states.
   * - Styled input fields and form elements with hover effects.
   */
  render () {
    this.shadowRoot.innerHTML = `
      <style>

      #question-container {
        font-size: 1.5rem;
        text-align: center
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        margin-bottom: 20px;
        color: #333;
        text-align: center;
      }

      #options-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
        align-items: center;
      }

      #options-container button {
        padding: 10px 20px;
        font-size: 1rem;
        background-color: #4a90e2;
        color: #ffffff;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s, transform 0.2s;
      }

      #options-container button:hover {
        background-color: #357ab7;
        transform: scale(1.05);
      }

      #options-container button:active {
        transform: scale(0.95);
      }
      #input-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
        align-items: center;
        padding: 10px;
        background-color: #f9f9f9;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        max-width: 400px;
        margin: 0 auto;
      }

      #answer-input {
        width: 100%;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1rem;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
      }
         #options-form {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      margin: 20px auto;
      padding: 10px;
      background-color: #f9f9f9;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      max-width: 400px;
    }

    #options-form div {
      display: flex;
      align-items: center;
      padding: 10px;
      margin-bottom: 10px;
      width: 100%;
      transition: background-color 0.3s ease, box-shadow 0.3s ease;
      border-radius: 5px;
      cursor: pointer;
    }

    #options-form div:hover {
      background-color: #e6f7ff; /* Light blue highlight */
      box-shadow: 0 2px 6px rgba(0, 123, 255, 0.2); /* Soft blue shadow */
    }

    input[type="radio"] {
      margin-right: 10px;
      transform: scale(1.2); /* Make radio buttons slightly larger */
    }

    label {
      font-size: 1.1rem;
      color: #333;
      cursor: pointer;
    }

    label:hover {
      color: #007bff;
    }
    </style>
      <div id="question-container"></div>
      <div id="options-container"></div>
    `
  }

  /**
   * Sets the current question and updates the DOM to display the question and its alternatives.
   *
   * @param {object} question - The question object to set.
   * @param {string} question.question - The question text.
   * @param {object} question.alternatives - An object containing the answer alternatives.
   * @throws Will log an error if no valid question is provided.
   * @throws Will log an error if the question container is not found in the shadow DOM.
   */
  setQuestion (question) {
    if (!question) return

    this.currentQuestion = question

    // Hämta frågecontainern och kontrollera att det finns ett giltigt element
    const questionContainer = this.shadowRoot.querySelector('#question-container')

    questionContainer.innerHTML = `<p>${question.question}</p>`

    // Hämta eller skapa alternativcontainern
    let optionsContainer = this.shadowRoot.querySelector('#options-container')
    if (!optionsContainer) {
      optionsContainer = document.createElement('div')
      optionsContainer.setAttribute('id', 'options-container')
      this.shadowRoot.appendChild(optionsContainer)
    } else {
      optionsContainer.innerHTML = ''
    }

    const alternatives = question.alternatives

    if (alternatives && typeof alternatives === 'object' && Object.keys(alternatives).length >= 2 && Object.keys(alternatives).length <= 10) {
    // Create a form element for the radio buttons
      const formElement = document.createElement('form')
      formElement.setAttribute('id', 'options-form')

      // Loop through alternatives and create radio buttons
      for (const [key, value] of Object.entries(alternatives)) {
        const radioWrapper = document.createElement('div')

        const radioInput = document.createElement('input')
        radioInput.setAttribute('type', 'radio')
        radioInput.setAttribute('name', 'answer')
        radioInput.setAttribute('value', key)
        radioInput.setAttribute('id', `option-${key}`)

        const label = document.createElement('label')
        label.setAttribute('for', `option-${key}`)
        label.textContent = value

        radioWrapper.appendChild(radioInput)
        radioWrapper.appendChild(label)
        formElement.appendChild(radioWrapper)
      }

      // Add a submit button
      const submitButton = document.createElement('button')
      submitButton.textContent = 'Submit Answer'
      submitButton.addEventListener('click', (event) => {
        event.preventDefault()
        const selectedRadio = formElement.querySelector('input[name="answer"]:checked')
        if (selectedRadio) {
          this.handleAnswerClick({ target: selectedRadio })
        }
      })
      formElement.appendChild(submitButton)
      optionsContainer.appendChild(formElement)
    } else {
      const input = document.createElement('input')
      input.setAttribute('type', 'text')
      input.setAttribute('id', 'answer-input')
      input.setAttribute('placeholder', 'Enter your answer here')
      optionsContainer.appendChild(input)

      const button = document.createElement('button')
      button.textContent = 'Submit Answer'
      button.addEventListener('click', (event) => {
        event.preventDefault()
        this.handleAnswerClick({ target: input })
      })

      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          this.handleAnswerClick({ target: input })
        }
      })

      optionsContainer.appendChild(button)
    }
  }

  /**
   * Validates that the question object is in the correct format.
   *
   * @param {object} question - The question object to validate.
   * @param {string} question.question - The text of the question.
   * @param {string} question.nextURL - The URL for the next question.
   * @returns {boolean} - Returns true if the question object is in the correct format, otherwise false.
   */
  validateQuestionFormat (question) {
    // Validerar att frågan är i korrekt format
    return question && typeof question.question === 'string' && question.nextURL
  }

  /**
   * Renders the current question and its options or input field for the user to answer.
   *
   * If `this.currentQuestion` is not set, logs an error message and returns.
   *
   * If `this.currentQuestion.options` is available and contains options, it generates buttons for each option.
   * Otherwise, it generates an input field for the user to type their answer.
   *
   * Adds click event listeners to the generated buttons or the submit button for handling the user's answer.
   */
  renderQuestion () {
    if (!this.currentQuestion) return

    // Generera HTML för frågan och dess alternativ
    const questionContainer = this.shadowRoot.querySelector('#question-container')
    questionContainer.innerHTML = `
      <p>${this.currentQuestion.question}</p>
    `

    if (this.currentQuestion.options && this.currentQuestion.options.length > 0) {
      questionContainer.innerHTML += `
      <div id="options-container">
          ${this.currentQuestion.options.map((option, index) =>
            `<button data-index="${index}">${option}</button>`
          ).join('')}
        </div>
      `
      this.shadowRoot.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', (event) => {
          this.handleAnswerClick(event)
        })
      })
    } else {
      // Om det inte finns några alternativ, rendera ett input-fält för användaren att skriva sitt svar
      questionContainer.innerHTML += `
        <div id="input-container">
          <input type="text" id="answer-input" placeholder="Enter your answer here">
          <button id="submit-answer">Submit Answer</button>
        </div>
      `
      // Lägg till klick-händelse för alla knappar
      const submitButton = this.shadowRoot.querySelector('#submit-answer')
      submitButton.addEventListener('click', (event) => {
        this.handleAnswerClick(event)
      })
    }
  }

  /**
   * Handles the click event on an answer option.
   *
   * This function processes the user's answer selection, whether it is from a set of radio buttons
   * or a text input field. It then dispatches a custom event with the selected answer.
   *
   * @param {Event} event - The click event triggered by the user.
   * @fires CustomEvent#answer-selected - Dispatched when an answer is selected.
   */
  handleAnswerClick (event) {
    if (!event) return

    let selectedAnswer = null

    // If we have alternatives, we should expect an answer from buttons
    if (this.currentQuestion.alternatives) {
      const selectedRadio = event.target
      if (selectedRadio === 'radio') {
        selectedAnswer = selectedRadio.value
      } else {
        const selectedRadioInput = this.shadowRoot.querySelector('input[name="answer"]:checked')
        if (selectedRadioInput) {
          selectedAnswer = selectedRadioInput.value
        }
      }
    } else {
      const inputElement = this.shadowRoot.querySelector('#answer-input')

      selectedAnswer = inputElement.value.trim()
    }

    this.currentSelectedAnswer = selectedAnswer

    this.dispatchEvent(new CustomEvent('answer-selected', {
      detail: { selectedAnswer },
      bubbles: true,
      composed: true
    }))
  }

  /**
   * Handles the text answer input from the user.
   *
   * This method retrieves the user's answer from the input field,
   * checks if the input is valid (not empty), and then dispatches
   * a custom event 'answer-selected' with the user's answer.
   *
   * @fires CustomEvent#answer-selected - Dispatched when a valid answer is entered.
   */
  handleTextAnswer () {
    const answerInput = this.shadowRoot.querySelector('#answer-input')
    if (!answerInput) return

    const userAnswer = answerInput.value.trim()
    if (userAnswer === '') return

    this.dispatchEvent(new CustomEvent('answer-selected', {
      detail: { selectedAnswer: userAnswer },
      bubbles: true,
      composed: true
    }))
  }
}

customElements.define('quiz-question', QuizQuestion)
