import { BlockElement } from "./block-element";
import { MarkdownLitElement } from "./markdown-lit-element";

export abstract class LeafElement extends BlockElement {

  selection = false;
  _selectionChangeHandler: any;

  connectedCallback() {
    super.connectedCallback();

    //this.setAttribute("contenteditable", "true");

    /*this.addEventListener("input", () => {
      this.normalizeChildren()
    });*/

    this.addEventListener('selectstart', () => {
      this.selection = true;

      // get the document
      // console.log('focus ' + this.tagName);
    });

    this._selectionChangeHandler = this.documentSelectionChange.bind(this);
    // this._selectionChangeHandler = this.documentSelectionChange;

    document.addEventListener('selectionchange', this._selectionChangeHandler);
  }

  // selectionToBlock(elementName: string) {
  //   const selection = document.getSelection()!;
  //   const selection_text = selection.toString();

  //   const element = document.createElement(elementName);
  //   element.textContent = selection_text;

  //   const range = selection.getRangeAt(0);
  //   range.deleteContents();
  //   range.insertNode(element);

  //   this.normalizeChildren();
  // }


  firstUpdated() {
  }

  disconnectedCallback() {
    if (this._selectionChangeHandler) {
      document.removeEventListener('selectionchange', this._selectionChangeHandler);
    }
  }

  documentSelectionChange() {
    if (
      this.ownerDocument.getSelection()?.rangeCount == 1
      && !this.ownerDocument.getSelection()?.getRangeAt(0).collapsed
      && this.ownerDocument.getSelection()?.anchorNode != null
      && this.contains((this.ownerDocument.getSelection()?.anchorNode as Node))
    ) {
      this.selection = true;
    } else {
      this.selection = false;
    }
  }

    /* normalize for an inline element consists of finding <br>s and
      - create a new element of the same type with the content after the <br>
      - remove the <br>
      - move the content after the <br> (which is in the newly created element) to the parent
      
    <parent>content1 <leaf>content2 <br/> content3</leaf> content4</parent>
        becomes
    <parent>content1 <leaf>content2 </leaf><leaf> content3</leaf> content4</parent>
  */
  normalize(): boolean {
    for (let i = 0; i < this.childNodes.length; i++) {
      const content = this.childNodes[i];
      if (content instanceof HTMLBRElement) {
        this.pushNodesAfterBreakToParent(content);
        this.removeChild(content);
        return false;
      } else if(content instanceof MarkdownLitElement) {
        if(content.normalize()) {
          return this.normalize();
        }
      }
    }
    return false;
  }

}
