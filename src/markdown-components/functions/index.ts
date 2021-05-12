import { MarkdownElement } from '../interfaces/markdown-element';

export function isMarkdownElement(x: any): x is MarkdownElement {
  return 'getMarkdown' in x;
}

export function getMarkdownWithTextForElement(element: Element): string {
  return Array.from(element.childNodes).map((child) => {
    if (isMarkdownElement(child)) {
      return child.getMarkdown();
    } else {
      return child.textContent;
    }
  }).join('');
}
