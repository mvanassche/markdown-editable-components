import { html, customElement } from 'lit-element';
import { TerminalInlineElement } from './abstract/inline-element';
import { getMarkdownWithTextForElement } from './functions';

@customElement('markdown-code-span')
export class CodeSpan extends TerminalInlineElement {
  mustBeDirectChildOfDocument = false;

  override render() {
    return html`<code><slot></slot></code>`;
  }

  override getMarkdown(): string {
    return '`' + getMarkdownWithTextForElement(this) + '`';
  }
  override containsMarkdownTextContent(): Boolean {
    return true;
  }
}
