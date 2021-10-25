/*
  inspiration:
    https://github.github.com/gfm/
    https://spec.commonmark.org/0.29/
    https://github.com/syntax-tree/mdast
*/

import { MarkdownDocument } from './markdown-editor-components/markdown-document';
import { MarkdownParagraph } from './markdown-components/markdown-paragraph';

import './markdown-components/markdown-break';
import './markdown-components/markdown-code';
import './markdown-components/markdown-code-span';
import './markdown-components/markdown-html';
import './markdown-components/markdown-image';
import './markdown-components/markdown-link';
import './markdown-components/markdown-list';
import './markdown-components/markdown-list-item';
import './markdown-components/markdown-paragraph';
import './markdown-components/markdown-quote';
import './markdown-components/markdown-strong';
import './markdown-components/markdown-emphasis';
import './markdown-components/markdown-strike';
import './markdown-components/markdown-table';
import './markdown-components/markdown-table-cell';
import './markdown-components/markdown-table-header-cell';
import './markdown-components/markdown-table-header-row';
import './markdown-components/markdown-task-list-item';
import './markdown-components/markdown-header-1';
import './markdown-components/markdown-header-2';
import './markdown-components/markdown-header-3';
import './markdown-components/markdown-header-4';
import './markdown-components/markdown-header-5';
import './markdown-components/markdown-header-6';
import './markdown-components/markdown-toc';

declare global {
  // TODO: fix eslint-disable
  // eslint-disable-next-line no-unused-vars
  interface HTMLElementTagNameMap {
    'markdown-document': MarkdownDocument;
    'markdown-paragraph': MarkdownParagraph;
  }
}

export * from './markdown-components/markdown-break';
export * from './markdown-components/markdown-code';
export * from './markdown-components/markdown-code-span';
export * from './markdown-components/markdown-html';
export * from './markdown-components/markdown-image';
export * from './markdown-components/markdown-link';
export * from './markdown-components/markdown-list';
export * from './markdown-components/markdown-list-item';
export * from './markdown-components/markdown-numeric-list';
export * from './markdown-components/markdown-numeric-list-item';
export * from './markdown-components/markdown-paragraph';
export * from './markdown-components/markdown-quote';
export * from './markdown-components/markdown-table';
export * from './markdown-components/markdown-table-cell';
export * from './markdown-components/markdown-table-header-cell';
export * from './markdown-components/markdown-table-header-row';
export * from './markdown-components/markdown-task-list-item';
export * from './markdown-components/markdown-header-1';
export * from './markdown-components/markdown-header-2';
export * from './markdown-components/markdown-header-3';
export * from './markdown-components/markdown-header-4';
export * from './markdown-components/markdown-header-5';
export * from './markdown-components/markdown-header-6';
export * from './markdown-components/markdown-toc';
export * from './markdown-components/interfaces/markdown-element';
