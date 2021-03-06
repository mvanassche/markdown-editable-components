import { LitElement, html, customElement, property, css } from 'lit-element';
import { LeafElement } from '../markdown-components/abstract/leaf-element';
import { isMarkdownElement } from '../markdown-components/functions';
import { TableOfContent } from '../markdown-components/markdown-toc';
import { parse } from '../marked-renderer';
import { Toolbar } from './markdown-toolbar';
import { MarkdownImage } from '../markdown-components/markdown-image';
import { MarkdownLink } from '../markdown-components/markdown-link';
import { MarkdownLitElement } from '../markdown-components/abstract/markdown-lit-element';

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

  _selectionchange: any;


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

    /*document.addEventListener('selectstart', () => {
    });*/

    this._selectionchange = this.selectionchange.bind(this);

    document.addEventListener('selectionchange', this._selectionchange);

    this.addEventListener('keydown', (e: KeyboardEvent) => {

      if (e.code === 'Enter') {
        e.preventDefault();
        this.handleEnterKeyDown();
      } else if (e.code === 'Backspace') {
        this.handleBackspaceKeyDown(e);
      } else if (e.code === 'Delete') {
        this.handleDeleteKeyDown(e);
      } else if (e.code === 'Tab') {
        e.preventDefault();
        this.handleTabKeyDown();
      }
      if(e.defaultPrevented) {
        // if default prevented, chances are that input is note triggered.
        this.normalizeContent();
        this.onChange();  
      }
    });

    this.addEventListener("input", () => {
      this.normalizeContent();
      this.onChange();
    });


    this.addEventListener('blur', () => {
      this.disableEditable();
    });

  }

  disconnectedCallback() {
    document.removeEventListener('selectionchange', this._selectionchange);
    super.disconnectedCallback();
  }

  getSelection(): Selection|null {
    if(this.selectionRoot.getSelection != null) {
      return this.selectionRoot.getSelection();
    } else {
      return this.ownerDocument.getSelection();
    }
  }

  selectionchange() {
    let selection = this.getSelection();

    if (selection?.anchorNode) {
      if (this.contains(selection?.anchorNode)) {
        var element: Node|null = selection.anchorNode;
        while(element && !(element instanceof MarkdownLitElement)) element = element.parentNode;
        if(element instanceof MarkdownLitElement && element.isEditable()) {
          this.enableEditable();
        } else {
          this.disableEditable();
        }

        this.currentSelection = selection;
        this.debugSelection();
        this.affectToolbar();
      } else {
        //
        this.disableEditable();
      }
    } else {
      this.disableEditable();
    }
  }

  editable = false;

  enableEditable() {
    if(!this.editable) {
      this.editable = true;
      this.toolbar?.classList.add('focus-enabled');
      this.toolbar?.classList.remove('focus-disabled');
    }
  }
  disableEditable() {
    if(this.editable) {
      this.editable = false;
      this.toolbar?.classList.remove('focus-enabled');
      this.toolbar?.classList.add('focus-disabled');
    }
  }


  debugSelection() {
    //console.log("selection " + this.selectionToContentRange())
    /*let ancohor = this.getSelection()?.anchorNode;
    if(ancohor instanceof Text) {
      console.log("     selection " + ancohor.textContent + " " + this.getSelection()?.anchorOffset)
    } else if(ancohor instanceof HTMLElement) {
      console.log("     selection " + ancohor.tagName + " " + this.getSelection()?.anchorOffset)
    }*/
  }

  // content range is a way to represent a selection that is less browser specific, and more markdown specific
  selectionToContentRange(): ([number, number] | null) {
    let selection = this.getSelection()
    if(selection && selection.anchorNode && selection.focusNode) {
      let anchorOffset = this.selectionNodeAndOffsetToContentOffset(selection.anchorNode, selection.anchorOffset);
      let focusOffset = this.selectionNodeAndOffsetToContentOffset(selection.focusNode, selection.focusOffset);
      if(anchorOffset != null && focusOffset != null) {
        return [anchorOffset, focusOffset];
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  selectionNodeAndOffsetToContentOffset(node: Node, offset: number): (number | null) {
    if(node == this) {
      return this.contentLengthUntil(this.childNodes[offset]);
    } else if(node instanceof MarkdownLitElement) {
      if(node.parentNode) {
        let parent = this.selectionNodeAndOffsetToContentOffset(node.parentNode, 
          Array.from(node.parentNode.childNodes).indexOf(node));
        if(parent != null) {
          return parent + node.contentLengthUntil(node.childNodes[offset]);
        } else {
          return null;
        }
      } else {
        return null;
      }
    } else if(node instanceof Text) {
      // find the parent
      if(node.parentNode) {
        let parent = this.selectionNodeAndOffsetToContentOffset(node.parentNode, 
          Array.from(node.parentNode.childNodes).indexOf(node));
        if(parent != null) {
          var littleBit = 0;
          /*if(offset == 0) {
            littleBit += 0.1;
          }
          if(offset == node.textContent?.replaceAll('\u200b', '').length) {
            littleBit -= 0.1;
          }*/
          // count the number of special characters that are not part of the content like the zero width space
          // before the offset!
          let numberOfSpecialChars = (node.textContent?.slice(0, offset)?.split('\u200b')?.length ?? 1) - 1;
          return parent + offset - numberOfSpecialChars + littleBit;
        } else {
          return null;
        }
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  contentLengthUntil(child: ChildNode): number {
    const childNodes = Array.from(this.childNodes);
    const indexOfChild = childNodes.indexOf(child);
    if(indexOfChild >= 0) {
      var result = 0;
      childNodes.slice(0, indexOfChild).forEach((child) => {
        if(child instanceof MarkdownLitElement) {
          result += child.contentLength();
        }
      });
      return result;  
    } else {
      return 0;
    }
  }

  setSelectionToContentRange(contentRange: [number, number]) {
    //console.log("Reset selection to " + contentRange);
    let [anchorNode, anchorOffset] = this.getNodeAndOffsetFromContentOffset(contentRange[0]);
    let [focusNode, focusOffset] = this.getNodeAndOffsetFromContentOffset(contentRange[1]);
    const range = document.createRange();
    range.setStart(anchorNode, anchorOffset);
    range.setEnd(focusNode, focusOffset);
    this.currentSelection?.removeAllRanges();
    this.currentSelection?.addRange(range);
  }

  getNodeAndOffsetFromContentOffset(contentOffset: number): [Node, number] {
    if(this.children.length > 0) {
      var resultNode = this.children[0];
      var previousNodeWasEol = false;
        // keep the first that will fit the offset
      for (let i = 0; i < this.children.length; i++) {
        let child = this.children[i];
        var lengthUntilChild = this.contentLengthUntil(child);
        if(contentOffset == lengthUntilChild) {
          if(previousNodeWasEol) {
            resultNode = child;
          }
          break;
        }
        if(contentOffset < lengthUntilChild) {
          break;
        }
        resultNode = child;
        previousNodeWasEol = (child instanceof MarkdownLitElement && child.elementEndWithEndOfLineEquivalent());
      }
      if(resultNode instanceof MarkdownLitElement) {
        return resultNode.getNodeAndOffsetFromContentOffset(contentOffset - this.contentLengthUntil(resultNode));
      } else {
        return [resultNode, Math.round(contentOffset) - this.contentLengthUntil(resultNode)];
      }
    } else {
      return [this, Math.round(contentOffset)]; // FIXME
    }
  }


  normalizeContent() {
    const selectionContentRangeBefore = this.selectionToContentRange();
    this.normalizeDOM();
    const selectionContentRangeAfter = this.selectionToContentRange();
    //console.log(selectionContentRangeBefore + " -> " + selectionContentRangeAfter);
    const equals = (a: ([number, number] | null), b: ([number, number] | null)) => {
      if(a == null && b == null) return true;
      if(a != null && b != null) {
        return a[0] == b[0] && a[1] == b[1];
      } else {
        return false;
      }
    };
    if(!equals(selectionContentRangeBefore, selectionContentRangeAfter)) {
      if(selectionContentRangeBefore) {
        this.setSelectionToContentRange(selectionContentRangeBefore);
      }
    }
    this.debugSelection();
  }
  
  normalizeDOM() {
    //console.log("doc normalize")
    for (let i = 0; i < this.childNodes.length; i++) {
      const child = this.childNodes[i];
      if(child instanceof MarkdownLitElement) {
        if(child.normalizeContent()) {
          this.normalizeDOM();
          break;
        }
      } else if (child instanceof HTMLDivElement) {
          // on chromium new lines are handled by divs, it splits up the tags properly.
        Array.from(child.childNodes).forEach((divChild) => {
          this.append(divChild);
        })
        child.remove();
      }
    }
  }

  contentLength(): number {
    var result = 0;
    Array.from(this.children).forEach((child) => {
      if(child instanceof MarkdownLitElement) {
        result += child.contentLength();
      }/* else {
        result += child.textContent?.length ?? 0; // What would that be??? what if not normalized? divs?
      }*/
    });
    return result;
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
    let selection = this.getSelection();

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


  handleEnterKeyDown() {
    document.execCommand('insertHTML', false, '&ZeroWidthSpace;<br/>&ZeroWidthSpace;');
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

  handleBackspaceKeyDown(e: KeyboardEvent) {
    const anchorOffset = this.currentSelection?.anchorOffset;
    const focusOffset = this.currentSelection?.focusOffset;
    const parent = this.currentSelection?.anchorNode?.parentElement;
    if (parent && anchorOffset == 0 && focusOffset == 0 && parent instanceof MarkdownLitElement) {
      e.preventDefault();
      parent.mergeWithPrevious(this.currentSelection);
    }
  }

  handleDeleteKeyDown(e: KeyboardEvent) {
    const anchor = this.currentSelection?.anchorNode;
    const anchorOffset = this.currentSelection?.anchorOffset;
    const focusOffset = this.currentSelection?.focusOffset;
    const parent = anchor?.parentElement;
    if (parent && anchor instanceof Text && anchorOffset == anchor.length && focusOffset == anchor.length && parent instanceof MarkdownLitElement) {
      e.preventDefault();
      parent.mergeNextIn();
    }
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
