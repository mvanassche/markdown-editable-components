import { html, customElement } from 'lit-element';
import { LeafElement } from './abstract/leaf-element';

@customElement('markdown-break')
export class ThematicBreak extends LeafElement {
  render() {
    return html`
      <hr />
    `;
  }

  getMarkdown(): string {
    return "-----------------------\n";
  }
  
  containsMarkdownTextContent(): Boolean {
    return false;
  }
}
