import { LitElement, html, customElement, css } from 'lit-element';

@customElement('toolbar-dropdown')
export class ToolbarDropdown extends LitElement {

  static styles = css`
    :host {
      position: relative;
      z-index: 10;
    }
    slot[name=dropdown-elements] {
      display: none;
      position: fixed;
    }
  `;

  render() {
    return html`
      <toolbar-button @click=${this.showDropdown}>
        <slot></slot>
      </toolbar-button>
      <slot name='dropdown-elements'></slot>
    `;
  }

  showDropdown(e: MouseEvent) {
    e.stopPropagation();  
    const dropdownElements: HTMLElement = this.shadowRoot?.querySelector('slot[name=dropdown-elements]') as HTMLElement;
    dropdownElements.style.display = 'block';
  }

  hideDropdown() {
    const dropdownElements: HTMLElement = this.shadowRoot?.querySelector('slot[name=dropdown-elements]') as HTMLElement;
    dropdownElements.style.display = 'none';
  }

  firstUpdated() {
    document.addEventListener('click', () => {
      this.hideDropdown();
    });
  }
}
