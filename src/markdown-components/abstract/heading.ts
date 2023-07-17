import { getMarkdownWithTextForElement } from "../functions";
import { LeafElement } from "./leaf-element";
//import { unsafeHTML } from 'lit-html/directives/unsafe-html';

export abstract class Heading extends LeafElement {
  mustBeDirectChildOfDocument = true;
  abstract depth: number;

  // Why this does not work?
  // render() {
  //   const template = `
  //     <h${this.level}>
  //       <slot></slot>
  //     </h${this.level}>
  //   `;
  //   html`${unsafeHTML(template)}`;
  // }

  override getMarkdown(): string {
    return '#'.repeat(this.depth) + ' ' + getMarkdownWithTextForElement(this) + '\n';
  }

  override newEmptyElementNameAfterBreak() {
    // after a title, we typically want a paragraph!
    return 'markdown-paragraph';
  }

  override containsMarkdownTextContent(): Boolean {
    return true;
  }

}
