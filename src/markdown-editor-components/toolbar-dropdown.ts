import { LitElement, html, customElement, css } from 'lit-element';

@customElement('toolbar-dropdown')
export class ToolbarDropdown extends LitElement {

  static override styles = css`
    :host {
      position: relative;
      z-index: 10;
    }
    slot[name=dropdown-elements] {
      display: none;
      position: fixed;
    }
  `;

  override render() {
    return html`
      <toolbar-button @mousedown=${this.showDropdown}>
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

  _mouseDownListener?: EventListener | null = null;

  override firstUpdated() {
    this._mouseDownListener = () => {
      this.hideDropdown();
    };
    document.addEventListener('mousedown', this._mouseDownListener, false);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if(this._mouseDownListener != null) {
      document.removeEventListener('mousedown', this._mouseDownListener, false);
    }
  }

}
