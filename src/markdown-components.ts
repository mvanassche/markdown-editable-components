/*
inspiration:
  https://github.github.com/gfm/
  https://spec.commonmark.org/0.29/
  https://github.com/syntax-tree/mdast
*/

import { MarkdownDocument } from './markdown-components/markdown-document';
import { Paragraph } from './markdown-components/markdown-paragraph';

import './markdown-components/markdown-break';
import './markdown-components/markdown-code';
import './markdown-components/markdown-code-span';
import './markdown-components/markdown-document';
import './markdown-components/markdown-html';
import './markdown-components/markdown-image';
import './markdown-components/markdown-link';
import './markdown-components/markdown-list';
import './markdown-components/markdown-list-item';
import './markdown-components/markdown-paragraph';
import './markdown-components/markdown-quote';
import './markdown-components/markdown-selection-actions';
import './markdown-components/markdown-table';
import './markdown-components/markdown-table-cell';
import './markdown-components/markdown-table-header-cell';
import './markdown-components/markdown-table-header-row';
import './markdown-components/markdown-task-list-item';
import './markdown-components/markdown-title-1';
import './markdown-components/markdown-title-2';
import './markdown-components/markdown-title-3';
import './markdown-components/markdown-title-4';
import './markdown-components/markdown-title-5';
import './markdown-components/markdown-title-6';
import './markdown-components/markdown-toc';
import './markdown-components/markdown-toolbar';

declare global {
  // TODO: fix eslint-disable
  // eslint-disable-next-line no-unused-vars
  interface HTMLElementTagNameMap {
    'markdown-document': MarkdownDocument;
    'markdown-paragraph': Paragraph;
  }
}
