import { Document } from '../markdown-elements.js';
//import {Paragraph} from '../markdown-elements.js';
//import {fixture, html} from '@open-wc/testing';

const assert = chai.assert;

suite('markdown-document', () => {
  test('is defined', () => {
    const el = document.createElement('markdown-document');
    assert.instanceOf(el, Document);
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
    const el = (await fixture(html`<markdown-elements></markdown-elements>`)) as MyElement;
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
