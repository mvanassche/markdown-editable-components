import { html, customElement } from 'lit-element';
import { InlineElement } from './abstract/inline-element';

@customElement('markdown-strike')
export class MarkdownStrike extends InlineElement {

  override render() {
    return html`<del><slot></slot></del>`;
  }

  override getMarkdown(): string {
    return '~~' + super.getMarkdown().trim() + '~~';
  }
  containsMarkdownTextContent(): Boolean {
    return true;
  }
}
