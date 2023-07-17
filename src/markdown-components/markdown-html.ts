import { html, customElement, css } from 'lit-element';
import { LeafElement } from './abstract/leaf-element';

@customElement('markdown-html')
export class HTML extends LeafElement {
  mustBeDirectChildOfDocument = false;
  static override styles = css`
  `;

  override render() {
    return html`
      <slot></slot>
    `;
  }

  override isEditable(): boolean {
    return false;
  }

  override getMarkdown(): string {
    return this.innerHTML.trimLeft().trimRight() + '\n\n';
  }
  override containsMarkdownTextContent(): Boolean {
    return true;
  }

}
