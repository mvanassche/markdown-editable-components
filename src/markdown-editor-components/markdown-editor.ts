import { html, customElement, css } from 'lit-element';
import { MarkdownDocument } from './markdown-document';
import { Toolbar } from './markdown-toolbar';

@customElement('markdown-editor')
export class MarkdownEditor extends MarkdownDocument {

  toolbar: Toolbar | null = null
  markdownDocument: MarkdownDocument  | null = null
  currentSelection: Selection | null = null

  static styles = [
    css`
    `
  ];

  constructor() {
    super();
  }

  render() {
    return html`
      <markdown-toolbar></markdown-toolbar>
      <slot></slot>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
  }

}
