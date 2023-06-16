export interface MarkdownElement extends Element {
  getMarkdown(): string
  mustBeDirectChildOfDocument: boolean // true for the elements that cannot be in other blocks, but must be a direct child of the markdown-document
}

/**
 * lists have levels, quotes have levels, as in you can use Tab/shift tab to make content go up and down, nesting unnesting.
 */
export interface MarkdownElementWithLevel {

    // as in Tab is pressed
    goDownOneLevel(child: Element | null): void;
    // as in Shift-Tab is pressed
    goUpOneLevel(child: Element | null): void;
}

export function isMarkdownElementWithLevel(element: any): element is MarkdownElementWithLevel {
  return element && (element as any).goDownOneLevel !== undefined;
}

/**
 * element that can escape by backspace, as in when user uses backspace, the content can be unnested from this element.
 * Quote is one example
 */
export interface MarkdownElementEscapeByBackspace {
  escapeByBackspace(child: Element | null): void;
}

export function isMarkdownElementEscapeByBackspace(element: any): element is MarkdownElementEscapeByBackspace {
return element && (element as any).escapeByBackspace !== undefined;
}
