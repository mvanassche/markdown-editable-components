import { html, customElement, css } from 'lit-element';
import { LeafElement } from './abstract/leaf-element';
import { MarkdownLitElement } from './abstract/markdown-lit-element';
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
      display: block;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0px;
      margin-inline-end: 0px;
    }
  `;

  render() {
    return html`<slot></slot>`;
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
    }).join('').replaceAll('\u200b', '') + '\n\n';
  }
  containsMarkdownTextContent(): Boolean {
    return true;
  }

  normalizeContent(): boolean {
    if(this.childNodes.length == 1 && this.childNodes[0] instanceof HTMLBRElement) {
      this.childNodes[0].remove();
      let p = document.createTextNode('\u200b');
      this.append(p);
    }
    if(this.lastChild instanceof MarkdownLitElement) {
      let p = document.createTextNode('\u200b');
      this.append(p);
    }
    return super.normalizeContent();
  }
  isEmpty(): boolean {
    return this.getMarkdown() == '\n\n';
  }
}
