/**
 * Nicknameform is a custom HTML element that provides a form for users to enter their nickname.
 * It extends the HTMLElement class and uses the Shadow DOM for encapsulation.
 *
 * @class Nicknameform
 * @augments {HTMLElement}
 * @class
 * @example
 * <nickname-form></nickname-form>
 */
class Nicknameform extends HTMLElement {
  /**
   * Creates an instance of the component and attaches a shadow DOM tree to it.
   */
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
  }

  /**
   * Called when the element is inserted into the DOM.
   * Initializes the component by rendering it and adding event listeners.
   *
   * @function connectedCallback
   */
  connectedCallback () {
    this.render()
    this.addEventListeners()
  }

  /**
   * Renders the nickname form component.
   *
   * This method sets the inner HTML of the shadow DOM with the structure and styles
   * for the nickname form. The form includes a label and an input field for entering
   * a nickname. The styles are applied to ensure the form is centered, styled, and
   * responsive to user interactions.
   *
   * The form includes:
   * - A label prompting the user to enter their nickname.
   * - A text input field with placeholder text and focus styles.
   *
   * Styles applied:
   * - Flexbox layout for centering and column direction.
   * - Background color, padding, border radius, and box shadow for the form.
   * - Font size, margin, and color for the label.
   * - Padding, width, border, border radius, and font size for the input field.
   * - Focus styles for the input field.
   * - Placeholder styles for the input field.
   */
  render () {
    this.shadowRoot.innerHTML = `
     <style>
      #nickname-form {
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: #f0f0f0;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        width: 300px;
        margin: auto;
      }
      
      label {
        font-size: 1.2rem;
        margin-bottom: 10px;
        color: #333;
      }
      
      input[type="text"] {
        padding: 10px;
        width: 100%;
        border: 1px solid #ccc;
        border-radius: 5px;
        font-size: 1rem;
        margin-bottom: 10px;
      }
      
      input[type="text"]:focus {
        border-color: #66afe9;
        outline: none;
        box-shadow: 0 0 8px rgba(102, 175, 233, 0.6);
      }
      
      #nickname-form input::placeholder {
        font-style: italic;
        color: #aaa;
      }
    </style>
      <form id="nickname-form">
          <label for="nickname">Enter your nickname:</label>
          <input type="text" id="nickname" name="nickname" required placeholder="Write and press enter">
      </form>
    `
  }

  /**
   * Adds event listeners to the nickname form.
   *
   * This method attaches a 'submit' event listener to the form with the ID 'nickname-form'.
   * When the form is submitted, it prevents the default form submission behavior,
   * retrieves the trimmed value of the input field with the ID 'nickname', and if the nickname
   * is not empty, dispatches a custom 'nickname' event with the nickname as the detail.
   */
  addEventListeners () {
    const form = this.shadowRoot.querySelector('#nickname-form')
    form.addEventListener('submit', (event) => {
      event.preventDefault()

      const nickname = this.shadowRoot.querySelector('#nickname').value.trim()

      if (nickname) {
        this.dispatchEvent(new CustomEvent('nickname', {
          detail: {
            nickname
          },
          bubbles: true,
          composed: true
        }))
      }
    })
  }
}

customElements.define('nickname-form', Nicknameform)
