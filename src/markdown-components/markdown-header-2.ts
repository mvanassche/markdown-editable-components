import { html, customElement, css } from 'lit-element';
import { Heading } from './abstract/heading';

@customElement('markdown-header-2')
export class Header2 extends Heading {
  depth = 2;

  static override styles = css`
    :host {
      position: relative;
      min-height: 1em;
    }
    h2 {
      font-size: (--header2-font-size);
    }
  `;

  override render() {
    return html`<h2><slot></slot></h2>`;
  }
}
