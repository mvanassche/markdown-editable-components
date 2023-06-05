import { LitElement, html, customElement, css, property } from 'lit-element';

@customElement('toggle-toolbar-button')
export class ToggleToolbarButton extends LitElement {
  
  static styles = css`
  `;

  @property({ type: Boolean })
  highlighted: boolean = false

  render() {
    return html`
      <toolbar-button ?highlighted=${this.highlighted}>
        <material-icon><slot></slot></material-icon>
      </toolbar-button>
    `;
  }
}
