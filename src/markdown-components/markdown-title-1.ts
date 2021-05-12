import { html, customElement, css } from 'lit-element';
import { Heading } from './abstract/heading';

@customElement('markdown-title-1')
export class Title1 extends Heading {
  depth = 1;

  static styles = css``;

  render() {
    return html`
      <h1>
        <slot></slot>
      </h1>
      <markdown-selection-actions></markdown-selection-actions>
    `;
  }
}
