import { html, customElement, css } from 'lit-element';
import { Heading } from './abstract/heading';

@customElement('markdown-title-4')
export class Title4 extends Heading {
  depth = 4;

  static styles = css``;

  render() {
    return html`
      <h4>
        <slot></slot>
      </h4>
      <markdown-selection-actions></markdown-selection-actions>
    `;
  }
}
