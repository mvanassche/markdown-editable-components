import { BlockElement } from "./block-element";

export abstract class LeafElement extends BlockElement {

  selection = false;
  _selectionChangeHandler: any;

  connectedCallback() {
    super.connectedCallback();

    //this.setAttribute("contenteditable", "true");

    this.addEventListener("input", () => {
      this.normalizeChildren()
    });

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

  normalizeChildren() {
    let changed = false;

    do {
      let currentChanged = false;

      for (let i = 0; i < this.childNodes.length; i++) {
        const content = this.childNodes[i];

        if (content instanceof HTMLDivElement) {
          content.remove();
          const next = document.createElement(this.tagName);
          next.innerText = content.innerText;
          this.parentNode?.insertBefore(next, this.nextSibling);
          //this.parentElement?.append(next);
          currentChanged = true;
          break;
        } else if (content instanceof LeafElement) {
          // if there is something right of selection, add sibling
          if (i < this.childNodes.length - 1 && !(i + 1 == this.childNodes.length - 1 && this.childNodes[i + 1]?.nodeValue?.replace(/\s/g, '').length == 0)) {
            const next = document.createElement(this.tagName);

            while (i + 1 < this.childNodes.length) {
              next.append(this.childNodes[i + 1]);
            }

            content.remove();
            this.parentNode?.insertBefore(next, this.nextSibling);
            this.parentNode?.insertBefore(content, this.nextSibling);
            //this.parentElement?.append(content);
            //this.parentElement?.append(next);
            (next as LeafElement).normalizeChildren();
          } else {
            content.remove();
            this.parentNode?.insertBefore(content, this.nextSibling);
            //this.parentElement?.append(content);
            // no need to break or change, we are done here
          }
        }
      }
      changed = currentChanged;  
    } while (changed)
    /*Array.from(this.children).forEach((content) => {
      if (content instanceof HTMLDivElement) {
        content.remove();
        let next = document.createElement(this.tagName);
        next.innerText = content.innerText;
        this.parentElement?.append(next);
      }
      if (content instanceof LeafElement) {
        // if there is something right of selection, add sibling
        if (content.nextSibling != null) {
          let next = document.createElement(this.tagName);
          next.innerText = content.nextSibling.innerText;
        }
        content.remove();
        this.parentElement?.append(content);
        this.parentElement?.append(next);
      }  
    });*/
  }

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
}
