import { html, customElement, css } from 'lit-element';
import { Heading } from './abstract/heading';

@customElement('markdown-header-1')
export class Header1 extends Heading {
  depth = 1;

  static styles = css`
      :host {
      position: relative;
      min-height: 1em;
    }
`;

  render() {
    return html`<h1><slot></slot></h1>`;
  }
}
