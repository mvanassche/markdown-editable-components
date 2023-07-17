import { normalizeChildContent } from "../../markdown-editor-components/markdown-document";
import { BlockElement } from "./block-element";
import { ContainerElement } from "./container-element";
import { MarkdownLitElement } from "./markdown-lit-element";

export abstract class LeafElement extends BlockElement {


  override connectedCallback() {
    super.connectedCallback();

    //this.setAttribute("contenteditable", "true");

    /*this.addEventListener("input", () => {
      this.normalizeChildren()
    });*/

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


  override firstUpdated() {
  }

  override disconnectedCallback() {
  }


    /* normalize for an inline element consists of finding <br>s and
      - create a new element of the same type with the content after the <br>
      - remove the <br>
      - move the content after the <br> (which is in the newly created element) to the parent
      
    <parent>content1 <leaf>content2 <br/> content3</leaf> content4</parent>
        becomes
    <parent>content1 <leaf>content2 </leaf><leaf> content3</leaf> content4</parent>
  */
  override normalizeContent(): boolean {
    this.normalize();
    if(this.childNodes.length == 0) {
      //this.fillEmptyElement();
      // remove empty leaf!
      this.remove();
      return true;
    }
    for (let i = 0; i < this.childNodes.length; i++) {
      const content = this.childNodes[i];
      if (content instanceof HTMLBRElement) {
        this.pushNodesAfterBreakToParent(content);
        this.removeChild(content);
        return true;
      } else if(content instanceof MarkdownLitElement) {
        if(content.normalizeContent()) {
          return this.normalizeContent();
        }
      } else if(content instanceof Text) {
        // TODO should this be higher up? not just leaves?
        if(content.length > 1 && content.textContent!.indexOf('\u200b') >= 0) {
          // if there was a ZWSP because it was empty to start with, but after, the user added more text after, the ZWSP has no purpose anymore
          content.textContent = content.textContent!.replace('\u200b', '');
        }
      } else {
        if(normalizeChildContent(content)) {
          return true;
        }
      }
    }
    return false;
  }


  override mergeWithPrevious(currentSelection: Selection | null) {
    // go previous, then potentially down if container
    this.mergeWith(currentSelection, this.previousElementSibling);
  }

  mergeWith(currentSelection: Selection | null, element: Element | null) {
    if(element) {
      if(element instanceof LeafElement) {
        // TODO modularize in top element
        if(currentSelection?.containsNode(this, true)) {
          element.setSelectionToEnd(currentSelection);
        }

        Array.from(this.childNodes).forEach((child) => {
          element?.appendChild(child);
        });
        
        this.remove();
      } else if(element instanceof ContainerElement) {
        // container -> try to merge with last down element
        this.mergeWith(currentSelection, element.lastElementChild);
      }
    }
  }

  override mergeNextIn() {
    if(this.nextElementSibling instanceof LeafElement) {
      Array.from(this.nextElementSibling.childNodes).forEach((child) => {
        this.appendChild(child);
      });
      this.nextElementSibling.remove();
    }
  }

  override elementEndWithEndOfLineEquivalent(): boolean {
    return ((this.textContent && this.textContent?.length > 0) || this.children.length > 0);
  }

}
