import { LitElement, html, customElement, css, property } from 'lit-element';

@customElement('toggle-toolbar-button')
export class ToggleToolbarButton extends LitElement {
  
  static override styles = css`
  `;

  @property({ type: Boolean })
  highlighted: boolean = false

  override render() {
    return html`
      <toolbar-button ?highlighted=${this.highlighted}>
        <material-icon><slot></slot></material-icon>
      </toolbar-button>
    `;
  }
}
