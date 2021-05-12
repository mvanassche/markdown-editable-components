import { html, customElement, css } from 'lit-element';
import { Heading } from './abstract/heading';

@customElement('markdown-title-3')
export class Title3 extends Heading {
  depth = 3;

  static styles = css``;

  render() {
    return html`
      <h3>
        <slot></slot>
      </h3>
      <markdown-selection-actions></markdown-selection-actions>
    `;
  }
}