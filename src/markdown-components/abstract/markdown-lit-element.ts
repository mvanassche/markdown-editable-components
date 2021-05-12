import { LitElement } from 'lit-element';
import { isMarkdownElement } from '../functions';
import { MarkdownElement } from '../interfaces/markdown-element';

export abstract class MarkdownLitElement extends LitElement implements MarkdownElement {
  getMarkdown(): string {
    return Array.from(this.children).map((child) => {
      if (isMarkdownElement(child)) {
        return child.getMarkdown();
      } else {
        return '';
      }
    }).join('');
  }
}