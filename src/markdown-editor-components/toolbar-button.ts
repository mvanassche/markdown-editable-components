import { LitElement, html, customElement, css, property } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';

@customElement('toolbar-button')
export class ToolbarButton extends LitElement {

  @property({ type: Boolean })
  highlighted: boolean = false

  static override styles = css`
    button {
      padding: 0;
      margin: 0;
      border: none;
      background-color: transparent;
      vertical-align: center;
      height: 24px;
    }
    button:hover {
      background-color: lightblue;
    }
    .highlighted {
      background-color: gray;
    }
  `;

  override render() {
    return html`
      <button class=${classMap({ highlighted: this.highlighted })}>
        <slot></slot>
      </button>
    `;
  }
}
