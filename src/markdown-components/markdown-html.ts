import { html, customElement, css } from 'lit-element';
import { LeafElement } from './abstract/leaf-element';

@customElement('markdown-html')
export class HTML extends LeafElement {
  static styles = css`
  `;

  render() {
    return html`
      <slot></slot>
    `;
  }

  isEditable(): boolean {
    return false;
  }

  getMarkdown(): string {
    return this.innerHTML.trimLeft().trimRight() + '\n\n';
  }
  containsMarkdownTextContent(): Boolean {
    return true;
  }

}
