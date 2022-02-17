import { LitElement, html, customElement, property, css } from 'lit-element';
import { LeafElement } from '../markdown-components/abstract/leaf-element';
import { isMarkdownElement } from '../markdown-components/functions';
import { TableOfContent } from '../markdown-components/markdown-toc';
import { parse } from '../marked-renderer';
import { Toolbar } from './markdown-toolbar';
import { MarkdownImage } from '../markdown-components/markdown-image';
import { MarkdownLink } from '../markdown-components/markdown-link';
import { MarkdownLitElement } from '../markdown-components/abstract/markdown-lit-element';
import { globalVariables } from '../styles/global-variables';
import { TerminalInlineElement } from '../markdown-components/abstract/inline-element';

@customElement('markdown-document')
export class MarkdownDocument extends LitElement {
  static styles = [
    /*
      TODO (borodanov):

      I put global variables here, because
      in this version of the editor, MarkdownDocument is the highest in the parent
      hierarchy. Possibly better solutions to use CSS variables in Shadow and
      Light DOM at the same time are existing but I didn't find after a lot of research.
      Some people have already looked for the same issues:
      https://stackoverflow.com/questions/48380267/css-variables-root-vs-host
      https://github.com/WICG/webcomponents/issues/338
      Importing :root { --my-var: ... } into a component is not working,
      but that would be the best solution for particular styles importing
      from separatly defined styles.

      For now these global variables are using for the synchronization the same size of
      markdown Headers and toolbar selectors of the current paragraph style
      which should look like Headers but with some differences, for example
      this selector should be without margins and paddings like in the
      markdown document view.
    */
    globalVariables,
    css`
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
    `,
  ];

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
  _selectstart: any;
  stashedSelection: any;
  _mousedown: any;
  _mouseup: any;
  _mouseSelection = false;
  isChrome = !!(window as any).chrome;


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

    this._mousedown = this.mousedown.bind(this);
    this.addEventListener('mousedown', this._mousedown);
    //ocument.addEventListener('mousedown', this._mousedown);
    this._mouseup = this.mouseup.bind(this);
    this.addEventListener('mouseup', this._mouseup);
    //document.addEventListener('mouseup', this._mouseup);

    this._selectstart = this.selectstart.bind(this);
    document.addEventListener('selectstart', this._selectstart);
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

      let current = this.getCurrentLeafBlock();
      if(current != null && (current as any).scrollIntoViewIfNeeded != null) { // until standard lands (https://github.com/w3c/csswg-drafts/pull/5677)
        (current as any).scrollIntoViewIfNeeded();
      }
    });

    this.addEventListener("input", () => {
      this.normalizeContent();
      this.onChange();
    });


    this.addEventListener('blur', () => {
      if(this.getAttribute("contenteditable") == "true")
      this.disableEditable();
    });

    this.addEventListener('drop', (e) => this.onDrop(e), false);
    this.addEventListener('dragover', (event) => {

      if (this.selectionRoot.caretPositionFromPoint) {
        var pos = this.selectionRoot.caretPositionFromPoint(event.clientX, event.clientY);
        let range = document.createRange();
        range.setStart(pos.offsetNode, pos.offset);
        range.collapse();
        this.getSelection()?.removeAllRanges();
        this.getSelection()?.addRange(range);    
      } else if (this.selectionRoot.caretRangeFromPoint) {
          let range = this.selectionRoot.caretRangeFromPoint(event.clientX, event.clientY);
          if(range) {
            this.getSelection()?.removeAllRanges();
            this.getSelection()?.addRange(range);    
          }
      }
      event.preventDefault();
      //event.stopPropagation();
    }, false);

  }

  disconnectedCallback() {
    document.removeEventListener('selectionchange', this._selectionchange);
    document.removeEventListener('selectstart', this._selectstart);
    //document.removeEventListener('mouseup', this._mouseup);
    //document.removeEventListener('mousedown', this._mousedown);
    super.disconnectedCallback();
  }

  getSelection(): Selection|null {
    if(this.selectionRoot.getSelection != null) {
      return this.selectionRoot.getSelection();
    } else {
      return this.ownerDocument.getSelection();
    }
  }

  onMouseSelection() {
  // see https://bugs.chromium.org/p/chromium/issues/detail?id=1162730
  if(this.isChrome) {
    this.setAttribute("contenteditable", "false");
    }
  }
  onEndMouseSelection() {
    if(this.isChrome && this.getAttribute("contenteditable") == "false") {
      this.setAttribute("contenteditable", "true");
      this.focus();
    }
  }

  mousedown(e: MouseEvent) {
    if(e.buttons % 2 == 1) {
      this._mouseSelection = true;
    }
  }
  mouseup() {
    this._mouseSelection = false;
    this.onEndMouseSelection();
  }
  selectstart() {
    /*const selection = this.getSelection();
    if (selection?.anchorNode) {
      if (this.contains(selection?.anchorNode)) {
        if(this._mouseSelection) {
          this.onMouseSelection();
        }
      }
    }*/
  }

  selectionchange() {
    const selection = this.getSelection();

    if (selection?.anchorNode) {
      if (this.contains(selection?.anchorNode)) {


        let element: Node | null = selection.anchorNode;
        while (element && !(element instanceof MarkdownLitElement)) {
          element = element.parentNode;
        }
        if (element instanceof MarkdownLitElement && element.isEditable()) {
          if(this._mouseSelection) {
            this.onMouseSelection();
          }/* else {
            this.onEndMouseSelection();
          }*/    
          this.enableEditable();
        } else {
          this.disableEditable();
        }

        this.currentSelection = selection;
        //console.log(this.currentSelection);
        this.stashedSelection = {
          anchorNode: selection.anchorNode,
          anchorOffset: selection.anchorOffset,
          focusNode: selection.focusNode,
          focusOffset: selection.focusOffset,
        };
        this.debugSelection();
        this.affectToolbar();
      } else {
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

  onDrop(event: DragEvent) {
    if(event.dataTransfer?.files != null && event.dataTransfer?.files?.length == 1) {
      let file = event.dataTransfer.files[0];
      if (file.type.match('image.*')) {
        event.stopPropagation();
        event.preventDefault();
        var reader = new FileReader();
        reader.onload = (theFile) => {
          //get the data uri
          var dataURI = theFile.target?.result;
          let img = document.createElement('markdown-image') as MarkdownImage;
          img.setAttribute('destination', dataURI as string);


          if (this.selectionRoot.caretPositionFromPoint) {
              var pos = this.selectionRoot.caretPositionFromPoint(event.clientX, event.clientY);
              let range = document.createRange();
              range.setStart(pos.offsetNode, pos.offset);
              range.collapse();
              range.insertNode(img);
          }
          // Next, the WebKit way. This works in Chrome.
          else if (this.selectionRoot.caretRangeFromPoint) {
              let range = this.selectionRoot.caretRangeFromPoint(event.clientX, event.clientY);
              range?.insertNode(img);
          } else if(this.getSelection()?.rangeCount) {
            this.getSelection()?.getRangeAt(0).insertNode(img);
          }
    
        };
        reader.readAsDataURL(file);    
      }
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
    let [anchorNode, anchorOffset] = this.getNodeAndOffsetFromContentOffsetAnchor(contentRange[0]);
    let [focusNode, focusOffset] = this.getNodeAndOffsetFromContentOffset(contentRange[1]);
    const range = document.createRange();
    range.setStart(anchorNode, anchorOffset);
    range.setEnd(focusNode, focusOffset);
    this.currentSelection?.removeAllRanges();
    this.currentSelection?.addRange(range);
  }

  getNodeAndOffsetFromContentOffsetAnchor(contentOffset: number): [Node, number] {
    if(this.children.length > 0) {
      var resultNode = this.children[0];
      //var previousNodeWasEol = false;
        // keep the first that will fit the offset
      for (let i = 0; i < this.children.length; i++) {
        let child = this.children[i];
        var lengthUntilChild = this.contentLengthUntil(child);

        if(contentOffset == lengthUntilChild) {
          //if(previousNodeWasEol) {
            resultNode = child;
          //}
          break;
        }
        if(contentOffset == 0 || contentOffset < lengthUntilChild) {
          break;
        }
        resultNode = child;
        //previousNodeWasEol = (child instanceof MarkdownLitElement && child.elementEndWithEndOfLineEquivalent());
      }
      if(resultNode instanceof MarkdownLitElement) {
        return resultNode.getNodeAndOffsetFromContentOffsetAnchor(contentOffset - this.contentLengthUntil(resultNode));
      } else {
        return [resultNode, Math.round(contentOffset) - this.contentLengthUntil(resultNode)];
      }
    } else {
      return [this, Math.round(contentOffset)]; // FIXME
    }
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
    this.domModificationOperation(() => {
      this.normalizeDOM();
    });
  }

  domModificationOperation(operation: () => void) {
    const selectionContentRangeBefore = this.selectionToContentRange();
    operation();
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
    this.affectToolbar();
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
      } else if (child instanceof HTMLImageElement) {
        let img = document.createElement('markdown-image') as MarkdownImage;
        child.replaceWith(img);
        //  src="${this.destination}" title="${this.title}" alt="${this.innerText}"
        if(child.getAttribute('src') != null) {
          img.destination = child.getAttribute('src')!;
        }
        if(child.getAttribute('title') != null) {
          img.destination = child.getAttribute('title')!;
        }
        if(child.getAttribute('alt') != null) {
          img.innerText = child.getAttribute('alt')!;
        }

      } else if (child instanceof Text && child.textContent!.trim().length > 0) {
        let p = document.createElement('markdown-paragraph');
        p.textContent = child.textContent;
        child.replaceWith(p);
        p.normalizeContent();
      }
    }
    if(this.lastElementChild == null || this.lastElementChild.tagName.toLowerCase() != 'markdown-paragraph') {
      let p = document.createElement('markdown-paragraph');
      p.textContent = '\u200b';
      this.append(p);
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
    setTimeout(() => {
      this.dispatchEvent(new CustomEvent("change")); // TODO, what should be the event details? also add other changes than inputs
    }, 0);
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
    this.normalizeContent();
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

      this.dispatchEvent(new CustomEvent('markdown-inserted', { detail: markdownBreak }));
      this.onChange();
    }
  }

  handleBackspaceKeyDown(e: KeyboardEvent) {
    const anchorOffset = this.currentSelection?.anchorOffset;
    const focusOffset = this.currentSelection?.focusOffset;
    const parent = this.currentSelection?.anchorNode?.parentElement;
    const sibling = this.currentSelection?.anchorNode?.previousSibling;
    if (parent && anchorOffset == 0 && focusOffset == 0 && parent instanceof MarkdownLitElement && sibling == null) {
      e.preventDefault();
      parent.mergeWithPrevious(this.currentSelection);
    } else if (sibling && anchorOffset == 0 && focusOffset == 0 &&
                  sibling instanceof MarkdownLitElement && sibling.isDeletableAsAWhole()) {
      e.preventDefault();
      sibling.remove();
    }
  }

  handleDeleteKeyDown(e: KeyboardEvent) {
    const anchor = this.currentSelection?.anchorNode;
    const anchorOffset = this.currentSelection?.anchorOffset;
    const focusOffset = this.currentSelection?.focusOffset;
    const parent = anchor?.parentElement;
    //const sibling = anchor?.nextSibling;
    if (parent && anchor instanceof Text && anchor.nextSibling == null && 
          anchorOffset == anchor.length && focusOffset == anchor.length && parent instanceof MarkdownLitElement) {
            // got to the end of the parent children -> merge next one in
      e.preventDefault();
      parent.mergeNextIn();
    } /*else if (sibling && anchor instanceof Text &&
          anchorOffset == anchor.length && focusOffset == anchor.length && sibling instanceof MarkdownLitElement &&
          sibling.isDeletableAsAWhole()) {
      e.preventDefault();
      sibling.remove();
    }*/
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


  allRangeUnderInline(tagName: string): Boolean | null {
    if(this.currentSelection && this.currentSelection.rangeCount > 0) {
      return allRangeUnderInline(tagName, this.currentSelection?.getRangeAt(0)!);
    } else {
      return null;
    }
  }

  affectToolbar() {

    if(this.allRangeUnderInline("markdown-strong") == true) {
      this.toolbar?.highlightBoldButton();
    } else {
      this.toolbar?.removeBoldButtonHighlighting();
    }
    if(this.allRangeUnderInline("markdown-emphasis") == true) {
      this.toolbar?.highlightItalicButton();
    } else {
      this.toolbar?.removeItalicButtonHighlighting();
    }
    if(this.allRangeUnderInline("markdown-strike") == true) {
      this.toolbar?.highlightStrikeButton();
    } else {
      this.toolbar?.removeBoldStrikeHighlighting();
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
    this.domModificationOperation(() => {
      if(this.currentSelection?.getRangeAt(0)) {
        surroundRangeIfNotYet('markdown-strong', this.currentSelection?.getRangeAt(0)!);
        this.normalizeDOM();
      }
    });
    this.onChange();
  }

  removeBold() {
    this.domModificationOperation(() => {
      if(this.currentSelection?.getRangeAt(0)) {
        unsurroundRange('markdown-strong', this.currentSelection?.getRangeAt(0)!);
        this.normalizeDOM();
      }
    });
    this.onChange();
  }

  wrapCurrentSelectionInNewElement(elementName: string): HTMLElement | null {
    const anchorOffset = this.currentSelection?.anchorOffset;
    const focusOffset = this.currentSelection?.focusOffset;
    const parent = this.currentSelection?.anchorNode?.parentElement;

    if (parent != null && anchorOffset != null && focusOffset != null) {
      const selectionLength = Math.abs(focusOffset - anchorOffset);

      const text = this.currentSelection?.anchorNode as Text;
      const secondPart = text.splitText(Math.min(anchorOffset, focusOffset));
      const thirdPart = secondPart.splitText(selectionLength);
      thirdPart;
      const replacement = document.createElement(elementName);
      replacement.appendChild(document.createTextNode(secondPart.data))
      secondPart.replaceWith(replacement);

      const range = document.createRange();
      range.selectNodeContents(replacement);
      this.currentSelection?.removeAllRanges();
      this.currentSelection?.addRange(range);
      this.onChange();
      return replacement;
    } else {
      return null;
    }
  }

  makeItalic() {
    this.domModificationOperation(() => {
      if(this.currentSelection?.getRangeAt(0)) {
        surroundRangeIfNotYet('markdown-emphasis', this.currentSelection?.getRangeAt(0)!);
        this.normalizeDOM();
      }
    });
    this.onChange();
  }
  removeItalic() {
    this.domModificationOperation(() => {
      if(this.currentSelection?.getRangeAt(0)) {
        unsurroundRange('markdown-emphasis', this.currentSelection?.getRangeAt(0)!);
        this.normalizeDOM();
      }
    });
    this.onChange();
  }

  makeUnderline() {
    //this.wrapCurrentSelectionInNewElement('u');
  }

  makeStrike() {
    this.domModificationOperation(() => {
      if(this.currentSelection?.getRangeAt(0)) {
        surroundRangeIfNotYet('markdown-strike', this.currentSelection?.getRangeAt(0)!);
        this.normalizeDOM();
      }
    });
    this.onChange();
  }
  removeStrike() {
    this.domModificationOperation(() => {
      if(this.currentSelection?.getRangeAt(0)) {
        unsurroundRange('markdown-strike', this.currentSelection?.getRangeAt(0)!);
        this.normalizeDOM();
      }
    });
    this.onChange();
  }

  makeCodeInline() {
    this.domModificationOperation(() => {
      if(this.currentSelection?.getRangeAt(0)) {
        surroundRangeIfNotYet('markdown-code-span', this.currentSelection?.getRangeAt(0)!);
        this.normalizeDOM();
      }
    });
    this.onChange();
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
      this.dispatchEvent(new CustomEvent('markdown-inserted', { detail: item }));
      this.onChange();
    }
  }

  listNumericClick() {
    if (this.currentSelection?.anchorNode) {
      const list = document.createElement('markdown-numeric-list');
      const item = document.createElement('markdown-numeric-list-item');
      item.innerHTML = "<br />";
      list.appendChild(item);

      (this.currentSelection?.anchorNode as HTMLElement).replaceWith(list);

      const range = document.createRange();
      range.selectNodeContents(item);
      range.collapse(true);
      this.currentSelection?.removeAllRanges();
      this.currentSelection?.addRange(range);
      this.dispatchEvent(new CustomEvent('markdown-inserted', { detail: item }));
      this.onChange();
    }
  }

  insertPhoto(url: string | null, text: string | null) {
    if (this.currentSelection?.anchorNode) {
      const image = document.createElement('markdown-image') as MarkdownImage;
      if(text) image.title = text;
      if(url != null) {
        image.destination = url;
      }

      const anchorOffset = this.currentSelection?.anchorOffset;
      const focusOffset = this.currentSelection?.focusOffset;
      const parent = this.currentSelection?.anchorNode?.parentElement;

      if (parent && anchorOffset != null && focusOffset != null) {
        const text = this.currentSelection?.anchorNode as Text;
        const secondPart = text.splitText(anchorOffset);
        secondPart;
        text.after(image);
        this.dispatchEvent(new CustomEvent('markdown-inserted', { detail: image }));
        this.onChange();
      }
    }
  }

  restoreStashedSelection() {
    const range = document.createRange();
    range.setStart(this.stashedSelection?.anchorNode, this.stashedSelection?.anchorOffset);
    range.setEnd(this.stashedSelection?.focusNode, this.stashedSelection?.focusOffset);
    this.currentSelection?.removeAllRanges();
    this.currentSelection?.addRange(range);
  }

  insertLink() { //url: string, text: string) {
    let link = this.wrapCurrentSelectionInNewElement('markdown-link') as MarkdownLink;
    if(link.textContent != null) {
      if(link.textContent == '') {
        link.textContent = 'http://'; 
      }
      link.destination = link.textContent;
    }
    link?.classList.add('fresh');

    //this.restoreStashedSelection();

    //let link = this.wrapCurrentSelectionInNewElement('markdown-link') as MarkdownLink;
    //link.destination = url;
    //link.innerHTML = text;

    /*if (this.currentSelection?.anchorNode) {
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
    }*/
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
      this.dispatchEvent(new CustomEvent('markdown-inserted', { detail: element }));
      this.onChange();
    }
  }

}

function getWord(range: Range): Range | null {
  if(range.collapsed && range.commonAncestorContainer instanceof Text) {
    let leftIndex = Math.max(0, range.commonAncestorContainer.textContent!.substring(0, range.startOffset).lastIndexOf(' ')); // TODO this should include other whitespaces.
    var rightIndex = range.commonAncestorContainer.textContent!.substring(range.startOffset).indexOf(' ') + range.startOffset;
    if(rightIndex <= range.startOffset) rightIndex = range.commonAncestorContainer.textContent!.length;
    let result = new Range();
    result.setStart(range.startContainer, leftIndex);
    result.setEnd(range.startContainer, rightIndex);
    return result;
  }
  return null;
}


function allRangeUnderInline(tagName: string, range: Range): Boolean {
  if(range.commonAncestorContainer instanceof Text) {
    return range.commonAncestorContainer.parentElement?.closest(tagName) != null;
  } else {
    if(range.commonAncestorContainer instanceof Element && range.commonAncestorContainer.closest(tagName) != null) {
      return true;
    }
  }
  let walk = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_TEXT, null);
  var n: Node | null;
  var result = false;
  while(n = walk.nextNode()) {
    if(n instanceof Text && range.intersectsNode(n) && isMarkdownContentTextNode(n)) { // avoid dom spaces at the document level. only user content
      if(n.parentElement?.closest(tagName) == null) {
        return false;
      } else {
        result = true;
      }
    }
  }
  return result;
}




function getAllTextNodesForRange(range: Range): Text[] {
  let startNode = range.startContainer;
  let endNode = range.endContainer;
  let startOffset = range.startOffset;
  var endOffset = range.endOffset;
  // split up text nodes if necessary
  if(startNode instanceof Text) {
    if(startOffset > 0 && startOffset < startNode.textContent!.length) {
      // split the text node to have whole text nodes corresponding to range
      let text = startNode.textContent!;
      startNode.parentElement?.insertBefore(document.createTextNode(text.substring(0, startOffset)), startNode);
      startNode.textContent = text.substring(startOffset);
      range.setStart(startNode, 0);
      if(startNode == endNode) {
        endOffset = endOffset - startOffset;
      }
    }
  }
  if(endNode instanceof Text) {
    if(endOffset < endNode.textContent!.length) {
      // split the text node to have whole text nodes corresponding to range
      let text = endNode.textContent!;
      let after = document.createTextNode(text.substring(endOffset));
      endNode.textContent = text.substring(0, endOffset);
      endNode.after(after);

    }
  }

  // get al the text nodes using commonAncestorContainer all text nodes that range intersectsNode
  if(range.commonAncestorContainer instanceof Text) {
    return [range.commonAncestorContainer];
  } else {
    let result: Text[] = [];
    let walk = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_TEXT, null);
    var n: Node | null;
    while(n = walk.nextNode()) {
      if(n instanceof Text && range.intersectsNode(n) && isMarkdownContentTextNode(n)) {
        result.push(n);
      }
    }
    return result;
  }
}


function isMarkdownContentTextNode(node: Text): Boolean {
  return isMarkdownElement(node.parentNode) && node.parentNode instanceof MarkdownLitElement && node.parentNode.containsMarkdownTextContent();
}

export function surroundRangeIfNotYet(tagName: string, range: Range) {
  if(range.collapsed) {
    let wordRange = getWord(range);
    if(wordRange != null) {
      surroundRangeIfNotYet(tagName, wordRange);
    } else {
      // split the text node and add 
      /*let text = (range.commonAncestorContainer as Text).textContent;
      (range.commonAncestorContainer as Text).textContent = 
      text?.substring(0, range.startOffset);*/
      document.execCommand('insertHTML', false, '<' + tagName + '>&ZeroWidthSpace;</' + tagName + '>'); // TODO better do it oursleves besed on range (this is selection based
    }
    return
  }
  let allTexts = getAllTextNodesForRange(range);
  allTexts.forEach((t) => {
    if(t.parentElement?.closest(tagName) == null) {
      var replaceLevel: ChildNode = t;
      while(replaceLevel.parentElement instanceof TerminalInlineElement) { // terminal inline is the lowest level you cannot surround the text inside, but it can be surrounded
        replaceLevel = replaceLevel.parentElement!;
      }
      let enclosing = document.createElement(tagName);
      replaceLevel.replaceWith(enclosing);
      enclosing.append(replaceLevel);
    }
  });
}

function dispatchToChildren(element: Element) {
  let sibling = element.nextSibling;
  let parent = element.parentElement;
  element.remove();
  Array.from(element.childNodes).forEach((ec) => {
    let ne = element.cloneNode(false);
    ne.appendChild(ec);
    parent?.insertBefore(ne, sibling);
  });

}


export function unsurroundRange(tagName: string, range: Range) {
  if(range.collapsed) {
    let wordRange = getWord(range);
    if(wordRange != null) {
      unsurroundRange(tagName, wordRange);
    }
    return
  }
  let allTexts = getAllTextNodesForRange(range);
  var surrounded = false;
  do {
    surrounded = false;
    allTexts.forEach((t) => {

      var enclosing = t.parentElement?.closest(tagName);
      if(enclosing != null) {
        // if ancestor is there, dispatch it down one level
        // we just push down the ancestor and fo on with the fixpoint
        surrounded = true;
        // bring down 
        dispatchToChildren(enclosing);
        // now if we are left with parent directly as the one to remove, remove that layer
        if(t.parentElement?.tagName?.toLowerCase() == tagName) {
          t.parentElement.replaceWith(t);
        } else {
          enclosing = t.parentElement?.closest(tagName)!;
          // invert enclosing and its child
          let ec = enclosing.childNodes[0]; // we know there is only one from dispatchToChildren
          enclosing.replaceWith(ec);
          Array.from(ec.childNodes).forEach((ecc) => { 
            ec.removeChild(ecc);
            enclosing?.append(ecc);
           });
           ec.appendChild(enclosing);
        }
      }
    });  
  } while(surrounded)
}


