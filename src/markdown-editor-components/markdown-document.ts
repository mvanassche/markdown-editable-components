import { LitElement, html, customElement, property, css } from 'lit-element';
import { LeafElement } from '../markdown-components/abstract/leaf-element';
import { isMarkdownElement } from '../markdown-components/functions';
import { TableOfContent } from '../markdown-components/markdown-toc';
import { parse } from '../marked-renderer';
import { Toolbar } from './markdown-toolbar';
import { MarkdownImage } from '../markdown-components/markdown-image';
import { MarkdownLink } from '../markdown-components/markdown-link';

@customElement('markdown-document')
export class MarkdownDocument extends LitElement {
  static styles = css`
    :host {
      display: block;
      border: solid 1px gray;
      border-top: none;
      padding: 16px;
    }
    .toolbar {
      z-index: 3;
      top: 0px;
      position: fixed;
      right: 30%;
      background: white;
    }
    .toc {
      position: absolute;
      z-index: 3;
      top: 0px;
      right: 0%;
    }
  `;

  @property()
  // TODO: fix eslint-disable
  // eslint-disable-next-line no-unused-vars
  parser: ((md: string) => string) = (markdown: string) => parse(markdown);

  @property()
  get markdown() { return this.getMarkdown(); }
  set markdown(markdown: string) { this.renderMarkdown(markdown) }

  @property({attribute : false })
  toolbar: Toolbar | null = null

  @property()
  selectionRoot: any = document;


  currentSelection: Selection | null = null




  render() {
    return html`
      <div>
        <div class="toolbar">
          <slot name="toolbar"></slot>
        </div>
        <div class="toc">
          <!-- <slot name="markdown-toc"></slot> -->
        </div>
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();

    this.setAttribute("contenteditable", "true");

    if (this.getAttribute("spellcheck") == null) {
      this.setAttribute("spellcheck", "false");
    }

    document.addEventListener('selectstart', () => {
    });

    document.addEventListener('selectionchange', () => {
      let selection;
      if(this.selectionRoot.getSelection != null) {
        selection = this.selectionRoot.getSelection();
      } else {
        selection = this.ownerDocument.getSelection();
      }

      if (selection?.anchorNode) {
        if (this.contains(selection?.anchorNode)) {
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
      this.querySelectorAll('markdown-paragraph').forEach(markdownParagraphEl => {
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

    this.addEventListener("input", () => this.onChange());

  }

  onChange() {
    this.dispatchEvent(new CustomEvent("change")); // TODO, what should be the event details? also add other changes than inputs
  }

  public setToolbar(toolbar: Toolbar) {
    this.toolbar = toolbar;
    this.toolbar.setMarkdownDocument(this);
  }

  firstUpdated() {
    if (this.getAttribute("floating-toc") == "true") {
      const toc = document.createElement("markdown-toc") as TableOfContent;
      toc.classList.add("floating");
      toc.markdownDocument = this;

      this.shadowRoot?.querySelector(".toc")?.appendChild(toc);

      // TODO: toc reacts to changes
    }

    if (this.getAttribute("toolbar") == "true") {
      this.toolbar = document.createElement("markdown-toolbar") as Toolbar;
      this.shadowRoot?.querySelector(".toolbar")?.appendChild(this.toolbar);
      // ??? this.toolbar.setMarkdownEditor(this);
    }
  }

  updated(changedProperties: Map<string, string>) { 
    if (changedProperties.has('markdown') && this.markdown != null) {
      this.renderMarkdown(this.markdown);
    }
    if(changedProperties.has('toolbar') && this.toolbar != null) {
      this.toolbar.setMarkdownDocument(this);
    }
  }

  public renderMarkdown(markdown: string) {
    // TODO: do not remove the toolbar!? Or maybe there should be
    // a markdown-editor component above document?

    this.innerHTML = this.parser(markdown);
  }

  public getMarkdown(): string {
    return Array.from(this.children).map((child) => {
      if (isMarkdownElement(child)) {
        return child.getMarkdown();
      } else {
        return "";
      }
    }).join('');
  }

  public getCurrentLeafBlock(): LeafElement | null {
    let selection;
    if(this.selectionRoot.getSelection != null) {
      selection = this.selectionRoot.getSelection();
    } else {
      selection = this.ownerDocument.getSelection();
    }

    const anchorNode = selection?.anchorNode;
    // console.log('anchorNode');
    // console.log(anchorNode);

    if (anchorNode != null) {
      let element: Node | null = anchorNode;

      while (element != null && element != document && !(element instanceof MarkdownDocument)) { 
        if (element instanceof LeafElement) {
          return element;
        }

        element = element?.parentNode;
      }
    }

    return null;
  }

  handleArrowLeftKeyDown(e: KeyboardEvent) {
    let parent: HTMLElement | null | undefined;

    if (this.currentSelection?.anchorNode?.nodeName.toLowerCase() === 'markdown-paragraph') {
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
      if (previousElementSibling?.firstChild.nodeName.toLowerCase() === "br") {
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

    if (this.currentSelection?.anchorNode?.nodeName.toLowerCase() === 'markdown-paragraph') {
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
      if (nextElementSibling?.firstChild.nodeName.toLowerCase() === "br") {
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

      if (parent?.tagName.toLowerCase() === 'markdown-paragraph') {
        replacementLeft = document.createElement('markdown-paragraph');
        replacementRight = document.createElement('markdown-paragraph');
      } else if (parent?.tagName.toLowerCase() === 'markdown-list-item') {
        replacementLeft = document.createElement('markdown-list-item');
        replacementRight = document.createElement('markdown-list-item');
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
          if (replacementRight?.firstChild.nodeName.toLowerCase() === "br") {
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

      this.onChange();
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
      this.onChange();
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
      const replacement = document.createElement('markdown-strong');
      replacement.appendChild(document.createTextNode(secondPart.data))
      secondPart.replaceWith(replacement);

      const range = document.createRange();
      range.selectNodeContents(replacement);
      this.currentSelection?.removeAllRanges();
      this.currentSelection?.addRange(range);
      this.onChange();
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
      const replacement = document.createElement('markdown-emphasis');
      replacement.appendChild(document.createTextNode(secondPart.data))
      secondPart.replaceWith(replacement);

      const range = document.createRange();
      range.selectNodeContents(replacement);
      this.currentSelection?.removeAllRanges();
      this.currentSelection?.addRange(range);
      this.onChange();
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
      this.onChange();
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
      const replacement = document.createElement('markdown-strike');
      replacement.appendChild(document.createTextNode(secondPart.data))
      secondPart.replaceWith(replacement);

      const range = document.createRange();
      range.selectNodeContents(replacement);
      this.currentSelection?.removeAllRanges();
      this.currentSelection?.addRange(range);
      this.onChange();
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
      this.onChange();
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
      this.onChange();
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
        this.onChange();
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
        this.onChange();
      }
    }
  }

  header1Element() {
    const element = document.createElement('markdown-header-1');
    const oldElement = this.getCurrentLeafBlock();

    if (oldElement != null) {
      element.innerHTML = oldElement.innerHTML;
      oldElement.replaceWith(element);
      this.onChange();
    }
  }

  header2Element() {
    const element = document.createElement('markdown-header-2');
    const oldElement = this.getCurrentLeafBlock();

    if (oldElement != null) {
      element.innerHTML = oldElement.innerHTML;
      oldElement.replaceWith(element);
      this.onChange();
    }
  }

  header3Element() {
    const element = document.createElement('markdown-header-3');
    const oldElement = this.getCurrentLeafBlock();

    if (oldElement != null) {
      element.innerHTML = oldElement.innerHTML;
      oldElement.replaceWith(element);
      this.onChange();
    }
  }

  header4Element() {
    const element = document.createElement('markdown-header-4');
    const oldElement = this.getCurrentLeafBlock();

    if (oldElement != null) {
      element.innerHTML = oldElement.innerHTML;
      oldElement.replaceWith(element);
      this.onChange();
    }
  }

  header5Element() {
    const element = document.createElement('markdown-header-5');
    const oldElement = this.getCurrentLeafBlock();

    if (oldElement != null) {
      element.innerHTML = oldElement.innerHTML;
      oldElement.replaceWith(element);
      this.onChange();
    }
  }

  header6Element() {
    const element = document.createElement('markdown-header-6');
    const oldElement = this.getCurrentLeafBlock();

    if (oldElement != null) {
      element.innerHTML = oldElement.innerHTML;
      oldElement.replaceWith(element);
      this.onChange();
    }
  }

  pararaphElement() {
    const element = document.createElement('markdown-paragraph');
    const oldElement = this.getCurrentLeafBlock();

    if (oldElement != null) {
      element.innerHTML = oldElement.innerHTML;
      oldElement.replaceWith(element);
      this.onChange();
    }
  }

  makeCodeBlock() {
    const element = document.createElement('markdown-code');
    const oldElement = this.getCurrentLeafBlock();

    if (oldElement != null) {
      element.innerHTML = oldElement.innerHTML;
      oldElement.replaceWith(element);
      this.onChange();
    }
  }

}
