import { getMarkdownWithTextForElement } from "../functions";
import { MarkdownLitElement } from "./markdown-lit-element";

export abstract class InlineElement extends MarkdownLitElement {
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
  normalize(): boolean {
    for (let i = 0; i < this.childNodes.length; i++) {
      const content = this.childNodes[i];
      if (content instanceof HTMLBRElement) {
        this.pushBreakAndNodesAfterToParent(content);
        return true;
      } else if(content instanceof MarkdownLitElement) {
        if(content.normalize()) {
          return this.normalize();
        }
      }
    }
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

}
