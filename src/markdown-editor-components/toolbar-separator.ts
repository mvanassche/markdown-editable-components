import { LitElement, html, customElement, css } from 'lit-element';

@customElement('toolbar-separator')
export class ToolbarSeparator extends LitElement {

  static override styles = css`
    .separator {
      width: 1px;
      background-color: gray;
      height: 24px;
      margin: 0 4px 0 4px;
    }
  `;

  override render() {
    return html`
      <div class='separator'></div>
    `;
  }

  override firstUpdated() {
  }
}
