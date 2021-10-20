import { html, customElement, css } from 'lit-element';
import { InlineElement } from './abstract/inline-element';

@customElement('markdown-strong')
export class MarkdownStrong extends InlineElement {

  static styles = css`
    :host {
      font-weight: bold;
    }
  `;

  render() {
    return html`<slot></slot>`;
  }

  getMarkdown(): string {
    return '**' + super.getMarkdown().trim() + '**';
  }
}
