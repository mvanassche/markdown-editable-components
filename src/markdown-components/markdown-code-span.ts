import { html, customElement } from 'lit-element';
import { TerminalInlineElement } from './abstract/inline-element';

@customElement('markdown-code-span')
export class CodeSpan extends TerminalInlineElement {

  render() {
    return html`<code><slot></slot></code>`;
  }

  getMarkdown(): string {
    return '`' + super.getMarkdown() + '`';
  }
  containsMarkdownTextContent(): Boolean {
    return true;
  }
}
