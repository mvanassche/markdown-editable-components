import { html, customElement } from 'lit-element';
import { LeafElement } from './abstract/leaf-element';

@customElement('markdown-break')
export class ThematicBreak extends LeafElement {
  mustBeDirectChildOfDocument = true;
  override render() {
    return html`
      <hr />
    `;
  }

  override getMarkdown(): string {
    return "-----------------------\n";
  }
  
  override containsMarkdownTextContent(): Boolean {
    return false;
  }
}
