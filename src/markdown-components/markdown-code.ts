import hljs from 'highlight.js';
import { html, customElement, css } from 'lit-element';
import { LeafElement } from './abstract/leaf-element';

@customElement('markdown-code')
export class CodeBlock extends LeafElement {

  mustBeDirectChildOfDocument = true;

  // TODO language string as property/attribute

  static override styles = css``;

  override render() {
    return html`<pre><code><slot></slot></code></pre>`;
  }

  override getMarkdown(): string {
    const lang = this.getAttribute("lang");
    const id = this.getAttribute("id");

    if (id != null) {
      return '``` ' + lang + ' {' + id + '}\n' + this.textContent + '\n```\n';
    } else {
      return '``` ' + lang + '\n' + this.textContent + '\n```\n';
    }
  }

  override connectedCallback() {
    super.connectedCallback();

    this.highlight();

    this.addEventListener("input", () => { 
      this.highlight() 
    });
  }
   
  highlight() {
    const lang = this.getAttribute("lang");

    if (lang != null && this.textContent != null) {
      this.innerHTML = hljs.highlight(lang, this.textContent).value;
    }
  }
  override containsMarkdownTextContent(): Boolean {
    return true;
  }
}
