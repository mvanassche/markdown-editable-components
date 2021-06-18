import { html, customElement, css } from 'lit-element';
import { Heading } from './abstract/heading';

@customElement('markdown-header-2')
export class Header2 extends Heading {
  depth = 2;

  static styles = css``;

  render() {
    return html`
      <h2>
        <slot></slot>
      </h2>
    `;
  }
}
