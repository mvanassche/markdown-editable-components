import { getMarkdownWithTextForElement } from "../functions";
import { MarkdownLitElement } from "./markdown-lit-element";

export abstract class InlineElement extends MarkdownLitElement {
  connectedCallback() {
    super.connectedCallback();
    //this.setAttribute("contenteditable", "true");
  }

  getMarkdown(): string {
    return getMarkdownWithTextForElement(this);
  }
}
