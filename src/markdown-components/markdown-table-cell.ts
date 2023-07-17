import { html, customElement, css } from 'lit-element';
import { ContainerElement } from "./abstract/container-element";
import { isMarkdownElement } from './functions';

@customElement('markdown-table-cell')
export class TableCell extends ContainerElement {
  mustBeDirectChildOfDocument = false;  

  static override styles = css`
    :host {
      display: table-cell;
      border: lightgrey 1px solid;
    }
  `;

  override render() {
    return html`
      <slot></slot>
    `;
  }

  override getMarkdown(): string {
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
    }).join('');
  }
  override containsMarkdownTextContent(): Boolean {
    return true;
  }
}
