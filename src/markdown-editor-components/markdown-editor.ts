import { LitElement, html, customElement, css } from 'lit-element';
import { MarkdownDocument } from './markdown-document';
import { Toolbar } from './markdown-toolbar';

@customElement('markdown-editor')
export class MarkdownEditor extends LitElement {

  toolbar: Toolbar | null = null
  markdownDocument: MarkdownDocument  | null = null
  currentSelection: Selection | null = null

  static styles = css`
  `;

  constructor() {
    super();
  }

  render() {
    return html`
      <markdown-toolbar></markdown-toolbar>
      <slot></slot>
    `;
  }

  connectedCallback() {
    super.connectedCallback();

    // document.addEventListener('selectstart', () => {
    // });

    // this.addEventListener('selectstart', () => {
    // });

    document.addEventListener('selectionchange', () => {
      const selection = document.getSelection();
      console.log('selectionchange');
      console.log(selection);
      this.currentSelection = selection;
      this.affectToolbar();
    });
  }

  affectToolbar() {
    if (this.currentSelection?.anchorNode?.parentElement?.tagName === "B") {
      this.toolbar?.highlightBoldButton();
    }

    if (this.currentSelection?.anchorNode?.parentElement?.tagName !== "B") {
      this.toolbar?.removeBoldButtonHighlighting();
    }

    if (this.currentSelection?.anchorNode?.parentElement?.tagName === "MARKDOWN-PARAGRAPH") {
      this.toolbar?.setDropdownTitle('Paragraph');
    }

    if (this.currentSelection?.anchorNode?.parentElement?.tagName === "MARKDOWN-HEADER-1") {
      this.toolbar?.setDropdownTitle('Heading 1');
    }

    if (this.currentSelection?.anchorNode?.parentElement?.tagName === "MARKDOWN-HEADER-2") {
      this.toolbar?.setDropdownTitle('Heading 2');
    }

    if (this.currentSelection?.anchorNode?.parentElement?.tagName === "MARKDOWN-HEADER-3") {
      this.toolbar?.setDropdownTitle('Heading 3');
    }

    if (this.currentSelection?.anchorNode?.parentElement?.tagName === "MARKDOWN-HEADER-4") {
      this.toolbar?.setDropdownTitle('Heading 4');
    }

    if (this.currentSelection?.anchorNode?.parentElement?.tagName === "MARKDOWN-HEADER-5") {
      this.toolbar?.setDropdownTitle('Heading 5');
    }

    if (this.currentSelection?.anchorNode?.parentElement?.tagName === "MARKDOWN-HEADER-6") {
      this.toolbar?.setDropdownTitle('Heading 6');
    }
  }

  makeBold() {
    // console.log(this.currentSelection);
    const anchorOffset = this.currentSelection?.anchorOffset;
    const focusOffset = this.currentSelection?.focusOffset;
    const parent = this.currentSelection?.anchorNode?.parentElement;
    // const selectionString = this.currentSelection?.toString();

    // this.currentSelection?.deleteFromDocument();

    if (parent && anchorOffset && focusOffset) {
      const selectionLength = focusOffset - anchorOffset;

      const text = this.currentSelection?.anchorNode as Text;
      const secondPart = text.splitText(anchorOffset);
      const thirdPart = secondPart.splitText(selectionLength);
      thirdPart;
      const replacement = document.createElement('b');
      replacement.appendChild(document.createTextNode(secondPart.data))
      secondPart.replaceWith(replacement);

      const range = document.createRange();
      range.selectNodeContents(replacement);
      this.currentSelection?.removeAllRanges();
      this.currentSelection?.addRange(range);

      // console.log(this.currentSelection?.anchorNode.split);
      // parent.innerHTML = `${parent?.innerHTML?.slice(0, anchorOffset)}<b>${selectionString}</b>${parent?.innerHTML?.slice(focusOffset)}`;
    }
  }

  firstUpdated() {
    this.toolbar = this.shadowRoot?.querySelector('markdown-toolbar') as Toolbar;
    this.toolbar.setMarkdownEditor(this);

    const slot = this.shadowRoot?.querySelector('slot');
    slot?.addEventListener('slotchange', () => {
      this.markdownDocument = slot.assignedElements()[0] as MarkdownDocument;
    });
  }

  header1Element() {
    const element = document.createElement('markdown-header-1');
    const oldElement = this.markdownDocument?.getCurrentLeafBlock();

    if (oldElement != null) {
      element.innerHTML = oldElement.innerHTML;
      oldElement.replaceWith(element);
    }
  }

  header2Element() {
    const element = document.createElement('markdown-header-2');
    const oldElement = this.markdownDocument?.getCurrentLeafBlock();

    if (oldElement != null) {
      element.innerHTML = oldElement.innerHTML;
      oldElement.replaceWith(element);
    }
  }

  header3Element() {
    const element = document.createElement('markdown-header-3');
    const oldElement = this.markdownDocument?.getCurrentLeafBlock();

    if (oldElement != null) {
      element.innerHTML = oldElement.innerHTML;
      oldElement.replaceWith(element);
    }
  }

  header4Element() {
    const element = document.createElement('markdown-header-4');
    const oldElement = this.markdownDocument?.getCurrentLeafBlock();

    if (oldElement != null) {
      element.innerHTML = oldElement.innerHTML;
      oldElement.replaceWith(element);
    }
  }

  header5Element() {
    const element = document.createElement('markdown-header-5');
    const oldElement = this.markdownDocument?.getCurrentLeafBlock();

    if (oldElement != null) {
      element.innerHTML = oldElement.innerHTML;
      oldElement.replaceWith(element);
    }
  }

  header6Element() {
    const element = document.createElement('markdown-header-6');
    const oldElement = this.markdownDocument?.getCurrentLeafBlock();

    if (oldElement != null) {
      element.innerHTML = oldElement.innerHTML;
      oldElement.replaceWith(element);
    }
  }

  pararaphElement() {
    const element = document.createElement('markdown-paragraph');
    const oldElement = this.markdownDocument?.getCurrentLeafBlock();

    if (oldElement != null) {
      element.innerHTML = oldElement.innerHTML;
      oldElement.replaceWith(element);
    }
  }
}
