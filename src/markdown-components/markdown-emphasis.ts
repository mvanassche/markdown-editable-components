import { html, customElement } from 'lit-element';
import { InlineElement } from './abstract/inline-element';

@customElement('markdown-emphasis')
export class MarkdownEmphasis extends InlineElement {

  render() {
    return html`<i><slot></slot></i>`;
  }

  getMarkdown(): string {
    return '*' + super.getMarkdown() + '*';
  }
}
