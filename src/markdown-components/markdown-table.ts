import { html, customElement, css } from 'lit-element';
import { ContainerElement } from './abstract/container-element';
import { TableRow } from './markdown-table-row';

@customElement('markdown-table')
export class Table extends ContainerElement {

  static styles = css`
    :host {
      display: table;
      border-collapse: collapse;
      /*border: lightgrey 1px solid;*/
    }
  `;

  render() {
    return html`
      <slot></slot>
    <!--markdown-selection-actions></markdown-selection-actions-->
  `;
  }

  getMarkdown(): string {
    return '\n' + Array.from(this.children).map((child) => {
      if (child instanceof TableRow) {
        return child.getMarkdown();
      } else {
        return "";
      }
    }).join('\n') + '\n';
  }
}
