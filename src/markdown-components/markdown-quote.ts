import { html, customElement, css } from 'lit-element';
import { MarkdownElementEscapeByBackspace, MarkdownElementWithLevel } from '../markdown-components';
import { ContainerElement } from './abstract/container-element';
import { isMarkdownElement } from './functions';
//import { MarkdownParagraph } from './markdown-paragraph';

@customElement('markdown-quote')
export class BlockQuote extends ContainerElement implements MarkdownElementWithLevel, MarkdownElementEscapeByBackspace {
  mustBeDirectChildOfDocument = true;
  
  static styles = css`
        :host {
          position: relative;
        }
        blockquote::before {
          position: absolute;
          width: 3px;
          height: 100%;
          left: 20px;
          background-color: lightgray;
          content: '';
        }
  `;
  render() {
    return html`
    <blockquote>
      <slot></slot>
    </blockquote>
  `;
  }

  getMarkdown(): string {
    return Array.from(this.childNodes).map((child) => {
      // FIXME THIS IS WRONG? SHOULD BE EVERY LINE, not every child
      if (isMarkdownElement(child)) {
        return '> ' + child.getMarkdown();
      } else {
        return '> ' + child.textContent;
      }
    }).join('');
  }
  containsMarkdownTextContent(): Boolean {
    return true;
  }


  mergeWithPrevious(_currentSelection: Selection | null) {
    if(this.firstChild) {
      this.before(this.firstChild);
    }
  }

  goDownOneLevel(child: Element | null): void {
    if(child) {
      const q = document.createElement('markdown-quote');
      child.replaceWith(q);
      q.append(child);
    }
  }
  goUpOneLevel(child: Element | null): void {
    // do a split, lower just the child
    if(child && this.childNodes.length > 1) {
      let indexOfChild = Array.from(this.childNodes).indexOf(child);
      if(indexOfChild < this.childNodes.length - 1) {
        const q = document.createElement('markdown-quote');
        this.after(q);
        for (let j = indexOfChild + 1; j < this.childNodes.length; j++) {
          q.append(this.childNodes[j]);
        }
      }
      if(indexOfChild > 0) {
        this.after(child);
      } else {
        this.before(child);
      }
      if(this.childNodes.length == 0) {
        this.remove();
      }
    } else {
      // not sure we want to get out the whole thing?
      // TODO maybe we should not get out if there are no quote parent? use closest?
      Array.from(this.childNodes).forEach(c => this.before(c));
      this.remove();
    }
  }

  escapeByBackspace(child: Element | null): void {
      this.goUpOneLevel(child);
  }

}
