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
    this.normalize();
    if(this.childNodes.length == 0) {
      //this.fillEmptyElement();
      // remove empty leaf!
      this.remove();
      return true;
    }
    for (let i = 0; i < this.childNodes.length; i++) {
      const content = this.childNodes[i];
      if (content instanceof HTMLBRElement) {
        this.pushNodesAfterBreakToParent(content);
        this.removeChild(content);
        return true;
      } else if(content instanceof MarkdownLitElement) {
        if(content.normalizeContent()) {
          return this.normalizeContent();
        }
      } else if(content instanceof Text) {
        // TODO should this be higher up? not just leaves?
        if(content.length > 1 && content.textContent!.indexOf('\u200b') >= 0) {
          content.textContent = content.textContent!.replace('\u200b', '');
        }
        
      }
    }
    return false;
  }


  contentLength(): number {
    var result = 0;
    Array.from(this.childNodes).forEach((child) => {
      if(child instanceof MarkdownLitElement) {
        result += child.contentLength();
      } else if(child instanceof HTMLBRElement) {
        result++;
      } else {
        // TODO remove special chars like zerowidth
        result += child.textContent?.replace('\u200b', '')?.length ?? 0;
      }
    });
    return result + this.endOfLineEquivalentLength();
  }

  contentLengthUntil(child: ChildNode): number {
    const childNodes = Array.from(this.childNodes);
    const indexOfChild = childNodes.indexOf(child);
    var result = 0;
    if(indexOfChild >= 0) {
      childNodes.slice(0, indexOfChild).forEach((child) => {
        if(child instanceof MarkdownLitElement) {
          result += child.contentLength();
        } else if(child instanceof HTMLBRElement) {
          result++;
        } else {
          result += child.textContent?.replace('\u200b', '')?.length ?? 0;
        }
      });
    }
    return result;
  }

  
  mergeWithPrevious(currentSelection: Selection | null) {
    if(this.previousElementSibling instanceof ListItem) {
      // TODO modularize in top element
      if(currentSelection?.containsNode(this, true)) {
        this.previousElementSibling.setSelectionToEnd(currentSelection);
      }

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

  elementEndWithEndOfLineEquivalent(): boolean {
    return (this.textContent && this.textContent?.length > 0) || this.children.length > 0;
  }

  containsMarkdownTextContent(): Boolean {
    return true;
  }

}
