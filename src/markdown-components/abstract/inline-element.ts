import { normalizeChildContent } from "../../markdown-editor-components/markdown-document";
import { getMarkdownWithTextForElement } from "../functions";
import { MarkdownLitElement } from "./markdown-lit-element";

export abstract class InlineElement extends MarkdownLitElement {

  mustBeDirectChildOfDocument = false;

  connectedCallback() {
    super.connectedCallback();
    //this.setAttribute("contenteditable", "true");
  }


  /* normalize for an inline element consists of finding <br>s and
      - create a new element of the same type with the content after the <br>
      - move the br to the parent, next to this
      - move the content after, in the newly created element to the parent, after the <br>

    <parent>content1 <inline>content2 <br/> content3</inline> content4</parent>
        becomes
    <parent>content1 <inline>content2 </inline><br/><inline> content3</inline> content4</parent>

    It is up to the parent to deal with the <br> at this point.
  */
  normalizeContent(): boolean {
    if(this.mergeSameSiblings() && this.nextSibling instanceof InlineElement && this.tagName == this.nextSibling.tagName) {
      Array.from(this.nextSibling.childNodes).forEach((e) => this.appendChild(e));
      this.parentNode?.removeChild(this.nextSibling);
      this.normalizeContent();
      return true;
    }
    for (let i = 0; i < this.childNodes.length; i++) {
      const content = this.childNodes[i];
      if (content instanceof HTMLBRElement) {
        this.pushBreakAndNodesAfterToParent(content);
        return true;
        //return this.normalizeContent();
      } else if(content instanceof MarkdownLitElement) {
        if(content.normalizeContent()) {
          return this.normalizeContent();
        }
      } else {
        if(normalizeChildContent(content)) {
          return true;
        }        
      }
    }
    return false;
  }

  mergeSameSiblings() {
    return false;
  }

  getMarkdown(): string {
    return getMarkdownWithTextForElement(this);
  }

  mergeWithPrevious(currentSelection: Selection | null) {
    if(this.parentNode instanceof MarkdownLitElement) {
      this.parentNode.mergeWithPrevious(currentSelection);
    }
  }

  mergeNextIn() {
    if(this.parentNode instanceof MarkdownLitElement) {
      this.parentNode.mergeNextIn();
    }
  }

}


export abstract class TerminalInlineElement extends MarkdownLitElement {
}
