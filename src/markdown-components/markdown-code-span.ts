import { html, customElement, css } from 'lit-element';
import { InlineElement } from './abstract/inline-element';

@customElement('markdown-code-span')
export class CodeSpan extends InlineElement {

  render() {
    return html`<code><slot></slot></code>`;
  }

  getMarkdown(): string {
    return '`' + super.getMarkdown() + '`';
  }
}
