import { html, customElement } from 'lit-element';
import { InlineElement } from './abstract/inline-element';

@customElement('markdown-strike')
export class MarkdownStrike extends InlineElement {

  render() {
    return html`<del><slot></slot></del>`;
  }

  getMarkdown(): string {
    return '~~' + super.getMarkdown() + '~~';
  }
}
