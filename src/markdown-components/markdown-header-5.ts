import { html, customElement, css } from 'lit-element';
import { Heading } from './abstract/heading';

@customElement('markdown-header-5')
export class Header5 extends Heading {
  depth = 5;

  static override styles = css`
    :host {
      position: relative;
      min-height: 1em;
    }
    h5 {
      font-size: (--header5-font-size);
    }
  `;

  override render() {
    return html`<h5><slot></slot></h5>`;
  }
}
