import { html, customElement, property, css } from 'lit-element';
import { MarkdownDocument } from '../markdown-editor-components/markdown-document';
import { ContainerElement } from './abstract/container-element';
import { List } from './markdown-list';
import { isMarkdownElement } from './functions';
import { MarkdownLitElement } from './abstract/markdown-lit-element';

@customElement('markdown-list-item')
export class ListItem extends ContainerElement {
  static styles = css`
    :host {
      position: relative;
      left: 20px;
    }
  `;

  @property({ type: Boolean })
  spread?: boolean

  render() {
    return html`<div class='item-container'><slot></slot></div>`;
  }

  getDepth(): number {
    let depth = 0;
    let ancestor = this.parentNode;

    while (ancestor != null && !(ancestor instanceof MarkdownDocument)) {
      if (ancestor instanceof List) {
        depth++;
      }

      ancestor = ancestor.parentNode;
    }

    return depth;
  }

  getMarkdown(): string {
    return '  '.repeat(this.getDepth()) + '- ' + this.getTaskMarkdown() + this.getMarkdownWithTextForElement(); // + '\n';
  }

  getTaskMarkdown(): string { return '' }  

  getMarkdownWithTextForElement(): string {
    return Array.from(this.childNodes).map((child) => {
      if (isMarkdownElement(child)) {
        return child.getMarkdown();
      } else {
        return child.textContent?.trim() + '\n'; // trim to avoid extra spaces and end of lines, which could be interpreted as paragraph
      }
    }).join('');
  }

  normalizeContent(): boolean {
    /*if(this.childNodes.length == 1 && this.childNodes[0] instanceof HTMLBRElement) {
      TODO: unindent, fallback to previous level, or paragraph, warning leave the rest of the items, meaning split the list.
      return true;
    }*/

    for (let i = 0; i < this.childNodes.length; i++) {
      const content = this.childNodes[i];
      if (content instanceof HTMLBRElement) {
        this.pushNodesAfterBreakToParent(content);
        this.removeChild(content)
        return false;
      } else if(content instanceof MarkdownLitElement) {
        if(content.normalizeContent()) {
          return this.normalizeContent();
        }
      }
    }
    return false;
  }

  mergeWithPrevious() {
    if(this.previousElementSibling instanceof ListItem) {
      Array.from(this.childNodes).forEach((child) => {
        this.previousElementSibling?.appendChild(child);
      });
      this.remove();
    }
  }

  mergeNextIn() {
    if(this.nextElementSibling instanceof ListItem) {
      Array.from(this.nextElementSibling.childNodes).forEach((child) => {
        this.appendChild(child);
      });
      this.nextElementSibling.remove();
    }
  }

  endOfLineEquivalentLength(): number {
    return 1; // leaves are equivalent to a line
  }


}
