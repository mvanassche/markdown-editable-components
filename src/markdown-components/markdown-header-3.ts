import { html, customElement, css } from 'lit-element';
import { Heading } from './abstract/heading';

@customElement('markdown-header-3')
export class Header3 extends Heading {
  depth = 3;

  static override styles = css`
    :host {
      position: relative;
      min-height: 1em;
    }
    h3 {
      font-size: (--header3-font-size);
    }
  `;

  override render() {
    return html`<h3><slot></slot></h3>`;
  }
}