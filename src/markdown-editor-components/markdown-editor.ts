import { html, customElement, css } from 'lit-element';
import { MarkdownDocument } from './markdown-document';
import { Toolbar } from './markdown-toolbar';

@customElement('markdown-editor')
export class MarkdownEditor extends MarkdownDocument {

  override toolbar: Toolbar | null = null
  markdownDocument: MarkdownDocument  | null = null
  override currentSelection: Selection | null = null

  static override styles = [
    css`
    `
  ];

  constructor() {
    super();
  }

  override render() {
    return html`
      <markdown-toolbar></markdown-toolbar>
      <slot></slot>
    `;
  }

  override connectedCallback() {
    super.connectedCallback();
  }

}
