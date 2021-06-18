import { LitElement, html, customElement, css } from 'lit-element';
import { MarkdownImage } from '../markdown-components/markdown-image';
import { MarkdownLink } from '../markdown-components/markdown-link';
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

    document.addEventListener('selectstart', () => {
    });

    document.addEventListener('selectionchange', () => {
      const selection = document.getSelection();

      if (selection?.anchorNode) {
        if (this.markdownDocument?.contains(selection?.anchorNode)) {
          this.currentSelection = selection;
          this.affectToolbar();
        } else {
          //
        }
      }
    });

    document.addEventListener('keyup', (e: KeyboardEvent) => {
      e;

      // manage br rules in paragraphs:
      // 1. there is should not be br in markdown-paragraph, if any text
      //    exists
      // 2. there is should be br, if there is no content in markdown-paragraph,
      //    to prevent disappearing of empty line
      document.querySelectorAll('markdown-paragraph').forEach(markdownParagraphEl => {
        if (markdownParagraphEl.childNodes.length > 1) {
          markdownParagraphEl.childNodes.forEach(el => {
            if (el.nodeName === 'BR') {
              el.remove();
            }
          })
        }

        // this rule is triggered when all text is erased from
        // paragraph node
        if (markdownParagraphEl.childNodes.length === 0) {
          markdownParagraphEl.appendChild(document.createElement('br'));
        }
      });
    });

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      console.log(e.code);

      if (e.code === 'Enter') {
        e.preventDefault();
        this.handleEnterKeyDown();
      } else if (e.code === 'Backspace') {
        this.handleBackspaceKeyDown();
      } else if (e.code === 'Tab') {
        e.preventDefault();
        this.handleTabKeyDown();
      } else if (e.code === 'ArrowLeft') {
        this.handleArrowLeftKeyDown(e);
      } else if (e.code === 'ArrowRight') {
        this.handleArrowRightKeyDown(e);
      }
    });
  }

  handleArrowLeftKeyDown(e: KeyboardEvent) {
    let parent: HTMLElement | null | undefined;

    if (this.currentSelection?.anchorNode?.nodeName === 'MARKDOWN-PARAGRAPH') {
      parent = this.currentSelection?.anchorNode as HTMLElement;
    } else if (this.currentSelection?.anchorNode?.nodeName === '#text') {
      parent = this.currentSelection?.anchorNode?.parentElement;
    }

    const anchorOffset = this.currentSelection?.anchorOffset;
    const focusOffset = this.currentSelection?.focusOffset;

    const previousElementSibling = parent?.previousElementSibling;

    if (previousElementSibling?.firstChild && anchorOffset === 0 && focusOffset === 0) {
      e.preventDefault();

      const range = document.createRange();
      if (previousElementSibling?.firstChild.nodeName === "BR") {
        range.selectNodeContents(previousElementSibling);
        range.collapse(true);
        this.currentSelection?.removeAllRanges();
        this.currentSelection?.addRange(range);
      } else {
        range.selectNodeContents(previousElementSibling?.firstChild);
        range.collapse();
        this.currentSelection?.removeAllRanges();
        this.currentSelection?.addRange(range);
      }
    }
  }

  handleArrowRightKeyDown(e: KeyboardEvent) {
    let parent: HTMLElement | null | undefined;
    let length;

    if (this.currentSelection?.anchorNode?.nodeName === 'MARKDOWN-PARAGRAPH') {
      parent = this.currentSelection?.anchorNode as HTMLElement;
      length = 0;
    } else if (this.currentSelection?.anchorNode?.nodeName === '#text') {
      parent = this.currentSelection?.anchorNode?.parentElement;
      length = (this.currentSelection?.anchorNode as Text).length;
    }

    const anchorOffset = this.currentSelection?.anchorOffset;
    const focusOffset = this.currentSelection?.focusOffset;

    const nextElementSibling = parent?.nextElementSibling;

    if (nextElementSibling?.firstChild && anchorOffset === length && focusOffset === length) {
      e.preventDefault();

      const range = document.createRange();
      if (nextElementSibling?.firstChild.nodeName === "BR") {
        range.selectNodeContents(nextElementSibling);
        range.collapse(true);
        this.currentSelection?.removeAllRanges();
        this.currentSelection?.addRange(range);
      } else {
        range.selectNodeContents(nextElementSibling?.firstChild);
        range.collapse(true);
        this.currentSelection?.removeAllRanges();
        this.currentSelection?.addRange(range);
      }
    }
  }

  handleEnterKeyDown() {
    const anchorOffset = this.currentSelection?.anchorOffset;
    const focusOffset = this.currentSelection?.focusOffset;
    const parent = this.currentSelection?.anchorNode?.parentElement;

    if (parent && typeof anchorOffset !== 'undefined' && typeof focusOffset !== 'undefined') {
      let replacementLeft, replacementRight;

      if (parent?.tagName === 'MARKDOWN-PARAGRAPH') {
        replacementLeft = document.createElement('markdown-paragraph');
        replacementRight = document.createElement('markdown-paragraph');
      } else if (parent?.tagName === 'MARKDOWN-LIST-ITEM') {
        replacementLeft = document.createElement('MARKDOWN-LIST-ITEM');
        replacementRight = document.createElement('MARKDOWN-LIST-ITEM');
      } else {
        //
      }

      if (replacementLeft && replacementRight) {
        replacementLeft.innerHTML = parent?.innerHTML?.slice(0, anchorOffset);
        replacementRight.innerHTML = parent?.innerHTML?.slice(focusOffset);

        if (replacementLeft.innerHTML.length === 0) {
          replacementLeft.innerHTML = "<br />";
        }

        if (replacementRight.innerHTML.length === 0) {
          replacementRight.innerHTML = "<br />";
        }

        parent.replaceWith(replacementLeft);
        replacementLeft.after(replacementRight);

        if (replacementRight?.firstChild) {
          const range = document.createRange();
          if (replacementRight?.firstChild.nodeName === "BR") {
            range.selectNodeContents(replacementRight);
            range.collapse(true);
            this.currentSelection?.removeAllRanges();
            this.currentSelection?.addRange(range);
          } else {
            range.selectNodeContents(replacementRight?.firstChild);
            range.collapse(true);
            this.currentSelection?.removeAllRanges();
            this.currentSelection?.addRange(range);
          }
        }
      }
    }
  }

  makeBreak() {
    const anchorOffset = this.currentSelection?.anchorOffset;
    const focusOffset = this.currentSelection?.focusOffset;
    const parent = this.currentSelection?.anchorNode?.parentElement;

    if (parent && anchorOffset && focusOffset) {
      const replacementLeft = document.createElement('markdown-paragraph');
      const replacementRight = document.createElement('markdown-paragraph');
      const markdownBreak = document.createElement('markdown-break');

      replacementLeft.innerHTML = parent?.innerHTML?.slice(0, anchorOffset);
      replacementRight.innerHTML = parent?.innerHTML?.slice(focusOffset);

      if (replacementLeft.innerHTML.length === 0) {
        replacementLeft.innerHTML = "<br />";
      }

      if (replacementRight.innerHTML.length === 0) {
        replacementRight.innerHTML = "<br />";
      }

      parent.replaceWith(replacementLeft);
      replacementLeft.after(markdownBreak);
      markdownBreak.after(replacementRight);

      const range = document.createRange();
      range.selectNodeContents(replacementRight);
      range.collapse(true);
      this.currentSelection?.removeAllRanges();
      this.currentSelection?.addRange(range);
    }
  }

  handleBackspaceKeyDown() {

  }

  handleTabKeyDown() {
    const parent = this.currentSelection?.anchorNode?.parentElement;
    
    if (parent) {
      const list = document.createElement('markdown-list');
      const item = document.createElement('markdown-list-item');

      item.innerHTML = parent?.innerHTML;
      list.appendChild(item);
      parent.innerHTML= '&nbsp';
      parent.appendChild(list);
    }
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
    const anchorOffset = this.currentSelection?.anchorOffset;
    const focusOffset = this.currentSelection?.focusOffset;
    const parent = this.currentSelection?.anchorNode?.parentElement;

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
    }
  }

  makeItalic() {
    const anchorOffset = this.currentSelection?.anchorOffset;
    const focusOffset = this.currentSelection?.focusOffset;
    const parent = this.currentSelection?.anchorNode?.parentElement;

    if (parent && anchorOffset && focusOffset) {
      const selectionLength = focusOffset - anchorOffset;

      const text = this.currentSelection?.anchorNode as Text;
      const secondPart = text.splitText(anchorOffset);
      const thirdPart = secondPart.splitText(selectionLength);
      thirdPart;
      const replacement = document.createElement('i');
      replacement.appendChild(document.createTextNode(secondPart.data))
      secondPart.replaceWith(replacement);

      const range = document.createRange();
      range.selectNodeContents(replacement);
      this.currentSelection?.removeAllRanges();
      this.currentSelection?.addRange(range);
    }
  }

  makeUnderline() {
    const anchorOffset = this.currentSelection?.anchorOffset;
    const focusOffset = this.currentSelection?.focusOffset;
    const parent = this.currentSelection?.anchorNode?.parentElement;

    if (parent && anchorOffset && focusOffset) {
      const selectionLength = focusOffset - anchorOffset;

      const text = this.currentSelection?.anchorNode as Text;
      const secondPart = text.splitText(anchorOffset);
      const thirdPart = secondPart.splitText(selectionLength);
      thirdPart;
      const replacement = document.createElement('u');
      replacement.appendChild(document.createTextNode(secondPart.data))
      secondPart.replaceWith(replacement);

      const range = document.createRange();
      range.selectNodeContents(replacement);
      this.currentSelection?.removeAllRanges();
      this.currentSelection?.addRange(range);
    }
  }

  makeStrike() {
    const anchorOffset = this.currentSelection?.anchorOffset;
    const focusOffset = this.currentSelection?.focusOffset;
    const parent = this.currentSelection?.anchorNode?.parentElement;

    if (parent && anchorOffset && focusOffset) {
      const selectionLength = focusOffset - anchorOffset;

      const text = this.currentSelection?.anchorNode as Text;
      const secondPart = text.splitText(anchorOffset);
      const thirdPart = secondPart.splitText(selectionLength);
      thirdPart;
      const replacement = document.createElement('strike');
      replacement.appendChild(document.createTextNode(secondPart.data))
      secondPart.replaceWith(replacement);

      const range = document.createRange();
      range.selectNodeContents(replacement);
      this.currentSelection?.removeAllRanges();
      this.currentSelection?.addRange(range);
    }
  }

  makeCodeInline() {
    const anchorOffset = this.currentSelection?.anchorOffset;
    const focusOffset = this.currentSelection?.focusOffset;
    const parent = this.currentSelection?.anchorNode?.parentElement;

    if (parent && anchorOffset && focusOffset) {
      const selectionLength = focusOffset - anchorOffset;

      const text = this.currentSelection?.anchorNode as Text;
      const secondPart = text.splitText(anchorOffset);
      const thirdPart = secondPart.splitText(selectionLength);
      thirdPart;
      const replacement = document.createElement('markdown-code-span');
      replacement.appendChild(document.createTextNode(secondPart.data))
      secondPart.replaceWith(replacement);

      const range = document.createRange();
      range.selectNodeContents(replacement);
      this.currentSelection?.removeAllRanges();
      this.currentSelection?.addRange(range);
    }
  }

  listBulletedClick() {
    if (this.currentSelection?.anchorNode) {

      const list = document.createElement('markdown-list');
      const item = document.createElement('markdown-list-item');
      item.innerHTML = "<br />";
      list.appendChild(item);

      (this.currentSelection?.anchorNode as HTMLElement).replaceWith(list);

      const range = document.createRange();
      range.selectNodeContents(item);
      range.collapse(true);
      this.currentSelection?.removeAllRanges();
      this.currentSelection?.addRange(range);
    }
  }

  insertPhoto(url: string, text: string) {
    if (this.currentSelection?.anchorNode) {
      const image = document.createElement('markdown-image') as MarkdownImage;
      image.destination = url;
      image.title = text;
      image.innerHTML = 'Logic Tools';

      const anchorOffset = this.currentSelection?.anchorOffset;
      const focusOffset = this.currentSelection?.focusOffset;
      const parent = this.currentSelection?.anchorNode?.parentElement;

      if (parent && anchorOffset && focusOffset) {
        const text = this.currentSelection?.anchorNode as Text;
        const secondPart = text.splitText(anchorOffset);
        secondPart;

        text.after(image);
      }
    }
  }

  insertLink(url: string, text: string) {
    if (this.currentSelection?.anchorNode) {
      const link = document.createElement('markdown-link') as MarkdownLink;
      link.destination = url;
      link.innerHTML = text;

      const anchorOffset = this.currentSelection?.anchorOffset;
      const focusOffset = this.currentSelection?.focusOffset;
      const parent = this.currentSelection?.anchorNode?.parentElement;
  
      if (parent && anchorOffset && focusOffset) {
        const text = this.currentSelection?.anchorNode as Text;
        const secondPart = text.splitText(anchorOffset);
        secondPart;

        text.after(link);
      }
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

  makeCodeBlock() {
    const element = document.createElement('markdown-code');
    const oldElement = this.markdownDocument?.getCurrentLeafBlock();

    if (oldElement != null) {
      element.innerHTML = oldElement.innerHTML;
      oldElement.replaceWith(element);
    }
  }
}
