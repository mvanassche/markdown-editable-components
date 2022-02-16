import { html, customElement } from 'lit-element';
import { TerminalInlineElement } from './abstract/inline-element';
import { getMarkdownWithTextForElement } from './functions';

@customElement('markdown-code-span')
export class CodeSpan extends TerminalInlineElement {

  render() {
    return html`<code><slot></slot></code>`;
  }

  getMarkdown(): string {
    return '`' + getMarkdownWithTextForElement(this) + '`';
  }
  containsMarkdownTextContent(): Boolean {
    return true;
  }
}
