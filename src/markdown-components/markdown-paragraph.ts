import { html, customElement, css } from 'lit-element';
import { LeafElement } from './abstract/leaf-element';
import { isMarkdownElement } from './functions';

@customElement('markdown-paragraph')
export class Paragraph extends LeafElement {
  static styles = css`
    :host {
      position: relative;
    }
  `;

  render() {
    return html`
      <p>
        <slot></slot>
      </p>
      <markdown-selection-actions></markdown-selection-actions>
    `;
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
