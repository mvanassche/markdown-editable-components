import { html, customElement, css } from 'lit-element';
import { Heading } from './abstract/heading';

@customElement('markdown-header-6')
export class Header6 extends Heading {
  depth = 6;

  static styles = css`
      :host {
      position: relative;
    }
`;

  render() {
    return html`
      <h6>
        <slot></slot>
      </h6>
    `;
  }
}
