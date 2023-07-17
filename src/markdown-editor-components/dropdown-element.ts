import { LitElement, html, customElement, css } from 'lit-element';

@customElement('dropdown-element')
export class DropdownElement extends LitElement {

  static override styles = css`
    .clickable:hover {
      background-color: lightblue;
      cursor: pointer;
    }
  `;

  override render() {
    return html`
      <div class='clickable'>
        <slot></slot>
      </div>
    `;
  }

  override firstUpdated() {
  }
}
