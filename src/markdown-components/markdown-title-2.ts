import { html, customElement, css } from 'lit-element';
import { Heading } from './abstract/heading';

@customElement('markdown-title-2')
export class Title2 extends Heading {
  depth = 2;

  static styles = css``;

  render() {
    return html`
      <h2>
        <slot></slot>
      </h2>
      <markdown-selection-actions></markdown-selection-actions>
    `;
  }
}
