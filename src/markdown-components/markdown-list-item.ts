import { html, customElement, property, css } from 'lit-element';
import { MarkdownDocument } from '../markdown-editor-components/markdown-document';
import { ContainerElement } from './abstract/container-element';
import { List } from './markdown-list';

@customElement('markdown-list-item')
export class ListItem extends ContainerElement {
  static styles = css`
    :host {
      position: relative;
      left: 20px;
    }
  `;

  @property({ type: Boolean })
  spread?: boolean

  render() {
    return html`
      <div class='item-container'><slot></slot></div>
      <!-- <markdown-selection-actions></markdown-selection-actions> -->
    `;
  }

  getDepth(): number {
    let depth = 0;
    let ancestor = this.parentNode;

    while (ancestor != null && !(ancestor instanceof MarkdownDocument)) {
      if (ancestor instanceof List) {
        depth++;
      }

      ancestor = ancestor.parentNode;
    }

    return depth;
  }

  getMarkdown(): string {
    return '  '.repeat(this.getDepth()) + '- ' + this.getTaskMarkdown() + super.getMarkdown(); // + '\n';
  }

  getTaskMarkdown(): string { return '' }
}
