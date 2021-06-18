import { html, customElement, css } from 'lit-element';
import { ContainerElement } from './abstract/container-element';
import { isMarkdownElement } from './functions';

@customElement('markdown-table-row')
export class TableRow extends ContainerElement {

  static styles = css`
    :host {
      display: table-row;
      border: lightgrey 1px solid;
    }
  `;

  render() {
    return html`
      <slot></slot>
  `;
  }

  public getMarkdown(): string {
    // TODO prettier output! use longest size etc.
    return '| ' + Array.from(this.children).map((child) => {
      if (isMarkdownElement(child)) {
        return child.getMarkdown();
      } else {
        return "";
      }
    }).join(' | ') + ' |';
  }
}
