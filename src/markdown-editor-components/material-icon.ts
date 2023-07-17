import { LitElement, html, customElement, css } from 'lit-element';

@customElement('material-icon')
export class MaterialIcon extends LitElement {
  static override styles = css`
    .material-icons {
      font-family: 'Material Icons';
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      font-feature-settings: 'liga';
      -moz-font-feature-settings: 'liga';
      -moz-osx-font-smoothing: grayscale;
    }
  `;

  override render() {
    return html`
      <style>${MaterialIcon.styles}</style>
      <i class="material-icons"><slot></slot></i>
    `;
  }
}
