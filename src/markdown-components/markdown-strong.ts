import { html, customElement } from 'lit-element';
import { InlineElement } from './abstract/inline-element';

@customElement('markdown-strong')
export class MarkdownStrong extends InlineElement {

  render() {
    return html`<strong><slot></slot></strong>`;
  }

  getMarkdown(): string {
    return '**' + super.getMarkdown().trim() + '**';
  }
}
