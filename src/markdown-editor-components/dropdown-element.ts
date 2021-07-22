import { LitElement, html, customElement, css } from 'lit-element';

@customElement('dropdown-element')
export class DropdownElement extends LitElement {

  static styles = css`
    .clickable:hover {
      background-color: lightblue;
      cursor: pointer;
    }
  `;

  render() {
    return html`
      <div class='clickable'>
        <slot></slot>
      </div>
    `;
  }

  firstUpdated() {
  }
}
