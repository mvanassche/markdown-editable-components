import { html, customElement, css } from 'lit-element';
import { InlineElement } from './abstract/inline-element';

@customElement('markdown-code-span')
export class CodeSpan extends InlineElement {

  // TODO info string as property/attribute

  static styles = css`
    :host {
      display: inline;
      font-family: monospace;
    }
  `;

  render() {
    return html`
      <slot></slot>
      <!-- <code>
        <slot></slot>
      </code> -->
      <!-- <markdown-selection-actions></markdown-selection-actions> -->
    `;
  }

  getMarkdown(): string {
    return '`' + super.getMarkdown() + '`';
  }
}