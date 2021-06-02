import { getMarkdownWithTextForElement } from "../functions";
import { LeafElement } from "./leaf-element";
//import { unsafeHTML } from 'lit-html/directives/unsafe-html';

export abstract class Heading extends LeafElement {
  abstract depth: number;

  // Why this does not work?
  // render() {
  //   const template = `
  //     <h${this.level}>
  //       <slot></slot>
  //     </h${this.level}>
  //     <markdown-selection-actions></markdown-selection-actions>
  //   `;
  //   html`${unsafeHTML(template)}`;
  // }

  getMarkdown(): string {
    return '#'.repeat(this.depth) + ' ' + getMarkdownWithTextForElement(this) + '\n';
  }
}
