import { html, customElement, css } from 'lit-element';
import { Heading } from './abstract/heading';

@customElement('markdown-title-6')
export class Title6 extends Heading {
  depth = 6;

  static styles = css``;

  render() {
    return html`
      <h6>
        <slot></slot>s
      </h6>
      <markdown-selection-actions></markdown-selection-actions>
    `;
  }
}
