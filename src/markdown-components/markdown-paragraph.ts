import { html, customElement, css } from 'lit-element';
import { LeafElement } from './abstract/leaf-element';
import { isMarkdownElement } from './functions';

/*
  Markdown paragraphs can contain only #text nodes or <br> element
  to prevent dissapearing of empty node
*/
@customElement('markdown-paragraph')
export class MarkdownParagraph extends LeafElement {
  static styles = css`
    :host {
      position: relative;
    }
    p {
      min-height: 1em;
      /*white-space: pre-wrap;*/
    }
  `;

  render() {
    return html`<p><slot></slot></p>`;
  }

  getMarkdown(): string {
    return Array.from(this.childNodes).map((child) => {
      if (isMarkdownElement(child)) {
        return child.getMarkdown();
      } else {
        if (child.textContent?.replace(/\s/g, '').length == 0) {
          return "";
        } else {
          return child.textContent?.replace(/^\s+/gm, ' ');
        }
      }
    }).join('') + '\n\n';
  }
}
