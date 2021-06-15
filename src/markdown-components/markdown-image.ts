import { html, customElement, property, css } from 'lit-element';
import { InlineElement } from './abstract/inline-element';

@customElement('markdown-image')
export class MarkdownImage extends InlineElement {
  @property()
  destination: string = '';

  @property()
  title: string = ''; // TODO make it optional

  static styles = css`
  `;

  render() {
    // TODO the alt innertext is not working
    return html`
      <img src="${this.destination}" title="${this.title}" alt="${this.innerText}"/>
      <slot style='display:none;'></slot>
    `;
  }

  getMarkdown(): string {
    return `![${this.innerText}](${this.destination} "${this.title}")`;
  }
}
