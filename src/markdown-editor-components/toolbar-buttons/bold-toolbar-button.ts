import { LitElement, html, customElement, css, property } from 'lit-element';

@customElement('bold-toolbar-button')
export class BoldToolbarButton extends LitElement {
  
  static styles = css`
  `;

  @property({ type: Boolean })
  highlighted: boolean = false

  render() {
    return html`
      <toolbar-button ?highlighted=${this.highlighted}>
        <material-icon>format_bold</material-icon>
      </toolbar-button>
    `;
  }
}
