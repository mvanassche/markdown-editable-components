//import {MarkdownParagraph} from '../markdown-editable-components.js';
//import {fixture, html} from '@open-wc/testing';
import { MarkdownDocument } from "../src/markdown-editor-components/markdown-document";

const assert = chai.assert;

suite('markdown-document', () => {
  test('is defined', () => {
    const el = document.createElement('markdown-document');
    assert.instanceOf(el, MarkdownDocument);
  });

  /*test('renders with default values', async () => {
    const el = await fixture(html`<markdown-document></markdown-document>`);
    assert.shadowDom.equal(
      el,
      `
      <h1>Hello, World!</h1>
      <button part="button">Click Count: 0</button>
      <slot></slot>
    `
    );
  });

  test('renders with a set name', async () => {
    const el = await fixture(html`<markdown-document name="Test"></markdown-document>`);
    assert.shadowDom.equal(
      el,
      `
      <h1>Hello, Test!</h1>
      <button part="button">Click Count: 0</button>
      <slot></slot>
    `
    );
  });

  test('handles a click', async () => {
    const el = (await fixture(html`<markdown-editable-components></markdown-editable-components>`)) as MyElement;
    const button = el.shadowRoot!.querySelector('button')!;
    button.click();
    await el.updateComplete;
    assert.shadowDom.equal(
      el,
      `
      <h1>Hello, World!</h1>
      <button part="button">Click Count: 1</button>
      <slot></slot>
    `
    );
  });*/
});
