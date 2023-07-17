import { html, customElement } from 'lit-element';
import { InlineElement } from './abstract/inline-element';

@customElement('markdown-emphasis')
export class MarkdownEmphasis extends InlineElement {

  override render() {
    return html`<i><slot></slot></i>`;
  }

  override getMarkdown(): string {
    return '*' + super.getMarkdown().trim() + '*';
  }

  override containsMarkdownTextContent(): Boolean {
    return true;
  }

}
