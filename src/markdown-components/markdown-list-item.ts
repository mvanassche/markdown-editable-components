import { html, customElement, property, css } from 'lit-element';
import { MarkdownDocument, normalizeChildContent } from '../markdown-editor-components/markdown-document';
import { ContainerElement } from './abstract/container-element';
import { List } from './markdown-list';
import { isMarkdownElement } from './functions';
import { MarkdownLitElement } from './abstract/markdown-lit-element';

@customElement('markdown-list-item')
export class ListItem extends ContainerElement {
  mustBeDirectChildOfDocument = false;
  
  static override styles = css`
    :host {
      position: relative;
      left: 20px;
    }
  `;

  @property({ type: Boolean })
  spread?: boolean

  override render() {
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

  override getMarkdown(): string {
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

  override normalizeContent(): boolean {
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
          // if there was a ZWSP because it was empty to start with, but after, the user added more text after, the ZWSP has no purpose anymore
          content.textContent = content.textContent!.replace('\u200b', '');
        }
      } else {
        if(normalizeChildContent(content)) {
          return true;
        }        
      }
    }
    return false;
  }


  override contentLength(): number {
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

  override contentLengthUntil(child: ChildNode): number {
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

  
  override mergeWithPrevious(currentSelection: Selection | null) {
    if(this.previousElementSibling instanceof ListItem) {
      // TODO modularize in top element
      if(currentSelection?.containsNode(this, true)) {
        this.previousElementSibling.setSelectionToEnd(currentSelection);
      }

      Array.from(this.childNodes).forEach((child) => {
        this.previousElementSibling?.appendChild(child);
      });
      
      this.remove();
    } else if(this.parentElement?.childNodes?.length == 1) {
      // there is only one item left
      Array.from(this.childNodes).forEach((child) => {
        this.parentElement?.after(child);
      });
      this.parentElement?.remove();
    }
  }



  override mergeNextIn() {
    if(this.nextElementSibling instanceof ListItem) {
      Array.from(this.nextElementSibling.childNodes).forEach((child) => {
        this.appendChild(child);
      });
      this.nextElementSibling.remove();
    }
  }


  override elementEndWithEndOfLineEquivalent(): boolean {
    return (this.textContent && this.textContent?.length > 0) || this.children.length > 0;
  }

  override containsMarkdownTextContent(): Boolean {
    return true;
  }

}
