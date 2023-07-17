import { customElement, property, css } from 'lit-element';
import { TableCell } from './markdown-table-cell';

// TODO: fix eslint-disable
// eslint-disable-next-line no-unused-vars
enum alignType {
  // eslint-disable-next-line no-unused-vars
  left= "left",
  // eslint-disable-next-line no-unused-vars
  right = "right",
  // eslint-disable-next-line no-unused-vars
  center = "center"
}

@customElement('markdown-table-header-cell')
export class TableHeaderCell extends TableCell {
  @property()
  align?: alignType

  static override styles = css`
    :host {
      display: table-cell;
      border: lightgrey 1px solid;
      background-color: lightgray;
    }
  `;
}
