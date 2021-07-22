import { html, customElement, css } from 'lit-element';
import { Heading } from './abstract/heading';

@customElement('markdown-header-4')
export class Header4 extends Heading {
  depth = 4;

  static styles = css`
    :host {
      position: relative;
      min-height: 1em;
    }
    h4 {
      font-size: (--header4-font-size);
    }
  `;

  render() {
    return html`<h4><slot></slot></h4>`;
  }
}
