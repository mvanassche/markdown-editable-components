import { html, customElement } from 'lit-element';
import { ContainerElement } from './abstract/container-element';
import { isMarkdownElement } from './functions';

@customElement('markdown-quote')
export class BlockQuote extends ContainerElement {
  render() {
    return html`
    <blockquote>
      <slot></slot>
    </blockquote>
    <!-- <markdown-selection-actions></markdown-selection-actions> -->
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
}
