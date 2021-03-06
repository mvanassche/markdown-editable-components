import { LitElement, html, customElement, css } from 'lit-element';

@customElement('dropdown-element')
export class DropdownElement extends LitElement {

  static styles = css`
  `;

  render() {
    return html`
      <toolbar-button>
        <slot></slot>
      </toolbar-button>
    `;
  }

  firstUpdated() {
  }
}
