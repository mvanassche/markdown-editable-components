import { LitElement, html, customElement, css } from 'lit-element';

@customElement('dropdown-elements')
export class DropdownElements extends LitElement {

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      border: 1px solid gray;
      background-color: white;
      box-shadow: 0px 0px 4px gray;
      padding: 10px;
    }
  `;

  render() {
    return html`
      <slot></slot>
    `;
  }

  firstUpdated() {
  }
}
