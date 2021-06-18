import { html, customElement, property, css } from 'lit-element';
import { InlineElement } from './abstract/inline-element';

@customElement('markdown-link')
export class MarkdownLink extends InlineElement {
  @property()
  destination: string = '';

  @property()
  title: string = ''; // TODO make it optional

  static styles = css`
  `;

  render() {
    return html`
      <a href="${this.destination}" title="${this.title}">
        <slot></slot>
      </a>
    `;
  }

  getMarkdown(): string {
    return `[${this.innerText}](${this.destination} "${this.title}")`;
  }
}
