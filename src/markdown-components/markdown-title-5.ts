import { html, customElement, css } from 'lit-element';
import { Heading } from './abstract/heading';

@customElement('markdown-title-5')
export class Title5 extends Heading {
  depth = 5;

  static styles = css``;

  render() {
    return html`
      <h5>
        <slot></slot>
      </h5>
      <markdown-selection-actions></markdown-selection-actions>
    `;
  }
}
