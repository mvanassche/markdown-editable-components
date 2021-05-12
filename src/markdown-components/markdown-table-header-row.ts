import { customElement, css } from 'lit-element';
import { TableRow } from './markdown-table-row';

@customElement('markdown-table-header-row')
export class TableHeaderRow extends TableRow {

  static styles = css`
    :host {
      display: table-row;
      border: lightgrey 1px solid;
    }
  `;

  public getMarkdown(): string {
    // TODO prettier output! use longest size etc.
    // TODO aligns
    return super.getMarkdown() + '\n' +
      '| ' + '--- |'.repeat(this.children.length);
  }
}
