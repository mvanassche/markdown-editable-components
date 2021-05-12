import { LitElement, html, customElement, property, css } from 'lit-element';
import { parse } from '../marked-renderer';
import { LeafElement } from './abstract/leaf-element';
import { isMarkdownElement } from './functions';
import { TableOfContent } from './markdown-toc';

@customElement('markdown-document')
export class MarkdownDocument extends LitElement {
  static styles = css`
    :host {
      display: block;
      /*border: solid 1px gray;*/
      padding: 16px;
    }
    .toolbar {
      position: absolute;
      z-index: 3;
      top: 0px;
      right: 10%;
    }
    .toc {
      position: absolute;
      z-index: 3;
      top: 0px;
      right: 0%;
    }
  `;

  render() {
    return html`
      <div>
        <div class="toolbar">
          <slot name="toolbar"></slot>
        </div>
        <div class="toc">
          <!-- <slot name="markdown-toc"></slot> -->
        </div>
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("contenteditable", "true");

    if (this.getAttribute("spellcheck") == null) {
      this.setAttribute("spellcheck", "false"); // by default, disable spellcheck
    }

    this.addEventListener("input", () => this.dispatchEvent(new CustomEvent("change"))); // TODO, what should be the event details? also add other changes than inputs
  }

  firstUpdated() {
    if (this.getAttribute("floating-toc") == "true") {
      const toc = document.createElement("markdown-toc") as TableOfContent;
      toc.classList.add("floating");
      toc.markdownDocument = this;
      this.shadowRoot?.querySelector(".toc")?.appendChild(toc);
      // TODO toc reacts to changes
    }
  }

  @property()
  // TODO: fix eslint-disable
  // eslint-disable-next-line no-unused-vars
  parser: ((md: string) => string) = (markdown: string) => parse(markdown);

  @property()
  get markdown() { return this.getMarkdown(); }
      
  set markdown(markdown: string) { this.renderMarkdown(markdown) }

  updated(changedProperties: Map<string, string>) { 
    if (changedProperties.has('markdown') && this.markdown != null) {
      this.renderMarkdown(this.markdown);
    }
   }

  public renderMarkdown(markdown: string) {
    // TODO do not remove the toolbar!? Or maybe there should be a markdown-editor component above document?
    this.innerHTML = this.parser(markdown);
  }

  public getMarkdown(): string {
    return Array.from(this.children).map((child) => {
      if (isMarkdownElement(child)) {
        return child.getMarkdown();
      } else {
        return "";
      }
    }).join('');
  }

  public getCurrentLeafBlock(): LeafElement | null {
    const anchorNode = document.getSelection()?.anchorNode;

    if (anchorNode != null) {
      let element: Node | null = anchorNode;

      while (element != null && element != document && !(element instanceof MarkdownDocument)) { 
        if (element instanceof LeafElement) {
          return element;
        }

        element = element?.parentNode;
      }
    }

    return null;
  }
}
