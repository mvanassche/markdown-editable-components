import { LitElement, html, customElement, css } from 'lit-element';
import { MarkdownDocument } from './markdown-document';
import { Toolbar } from './markdown-toolbar';

@customElement('markdown-editor')
export class MarkdownEditor extends LitElement {

  toolbar: Toolbar | null = null
  markdownDocument: MarkdownDocument  | null = null

  static styles = css`
  `;

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

  firstUpdated() {
    this.toolbar = this.shadowRoot?.querySelector('markdown-toolbar') as Toolbar;
    this.toolbar.setMarkdownEditor(this);

    const slot = this.shadowRoot?.querySelector('slot');
    slot?.addEventListener('slotchange', () => {
      this.markdownDocument = slot.assignedElements()[0] as MarkdownDocument;
    });
  }
}
