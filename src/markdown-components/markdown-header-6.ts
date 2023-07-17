import { html, customElement, css } from 'lit-element';
import { Heading } from './abstract/heading';

@customElement('markdown-header-6')
export class Header6 extends Heading {
  depth = 6;

  static override styles = css`
    :host {
      position: relative;
      min-height: 1em;
    }
    h6 {
      font-size: (--header6-font-size);
    }
  `;

  override render() {
    return html`<h6><slot></slot></h6>`;
  }
}
