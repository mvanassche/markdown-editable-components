import { html, customElement, css } from 'lit-element';
import { ContainerElement } from './abstract/container-element';
import { isMarkdownElement } from './functions';

@customElement('markdown-quote')
export class BlockQuote extends ContainerElement {
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
}
