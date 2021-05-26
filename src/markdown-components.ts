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
// import './markdown-components/markdown-document';
// import './markdown-components/markdown-editor';
import './markdown-components/markdown-html';
import './markdown-components/markdown-image';
import './markdown-components/markdown-link';
import './markdown-components/markdown-list';
import './markdown-components/markdown-list-item';
import './markdown-components/markdown-paragraph';
import './markdown-components/markdown-quote';
// import './markdown-components/markdown-selection-actions';
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
// import './markdown-components/markdown-toolbar';

// // editor components
// import './toolbar-button';
// import './material-icon-button';
// import './toolbar-separator';
// import './toolbar-dropdown';

declare global {
  // TODO: fix eslint-disable
  // eslint-disable-next-line no-unused-vars
  interface HTMLElementTagNameMap {
    'markdown-document': MarkdownDocument;
    'markdown-paragraph': MarkdownParagraph;
  }
}
