import { html, customElement, css } from 'lit-element';
import { InlineElement } from './abstract/inline-element';

@customElement('markdown-strong')
export class MarkdownStrong extends InlineElement {

  static override styles = css`
    :host {
      font-weight: bold;
    }
  `;

  override render() {
    return html`<slot></slot>`;
  }

  override getMarkdown(): string {
    return '**' + super.getMarkdown().trim() + '**';
  }

  override mergeSameSiblings() {
    return true;
  }
  override containsMarkdownTextContent(): Boolean {
    return true;
  }
}
