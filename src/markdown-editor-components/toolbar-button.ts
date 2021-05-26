import { LitElement, html, customElement, css } from 'lit-element';

@customElement('toolbar-button')
export class ToolbarButton extends LitElement {

  static styles = css`
    :host {
    }
    button {
      padding: 0;
      margin: 0;
      border: none;
      background-color: transparent;
      vertical-align: center;
      height: 24px;
    }
  `;

  render() {
    return html`
      <button>
        <slot></slot>
      </button>
    `;
  }

  firstUpdated() {
  }
}
