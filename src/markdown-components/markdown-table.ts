import { html, customElement, css } from 'lit-element';
import { ContainerElement } from './abstract/container-element';
import { TableRow } from './markdown-table-row';

@customElement('markdown-table')
export class Table extends ContainerElement {
  mustBeDirectChildOfDocument = true; // ???
  
  static override styles = css`
    :host {
      display: table;
      border-collapse: collapse;
      /*border: lightgrey 1px solid;*/
    }
  `;

  override render() {
    return html`
      <slot></slot>
  `;
  }

  override getMarkdown(): string {
    return '\n' + Array.from(this.children).map((child) => {
      if (child instanceof TableRow) {
        return child.getMarkdown();
      } else {
        return "";
      }
    }).join('\n') + '\n';
  }
  override containsMarkdownTextContent(): Boolean {
    return false;
  }
}
