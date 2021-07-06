import { LitElement } from 'lit-element';
import { isMarkdownElement } from '../functions';
import { MarkdownElement } from '../interfaces/markdown-element';

export abstract class MarkdownLitElement extends LitElement implements MarkdownElement {

  // returns a boolean that if true, it means that the element changed something that will impact a ancestor, so normalize should be redone
  normalize(): boolean {
    for (let i = 0; i < this.childNodes.length; i++) {
      const content = this.childNodes[i];
      if(content instanceof MarkdownLitElement) {
        if(content.normalize()) {
          return this.normalize();
        }
      }
    }
    return false;
  }

  pushNodesAfterBreakToParent(content: HTMLBRElement) {
    if(this.parentNode != null) {
      // extract the br out of this element and take what's right of br, encapsulate in an element of the same type as this
      const elementsToMove: Node[] = []; 

      let indexOfBreak = Array.from(this.childNodes).indexOf(content);
      for (let j = indexOfBreak + 1; j < this.childNodes.length; j++) {
        elementsToMove.push(this.childNodes[j]);
        if(document.getSelection()?.containsNode(this.childNodes[j], true)) {
          //console.log("cursor at " + this.childNodes[j])  TODO sometimes the cursor gets a little weird, so we need to fix it?
        }
      }
      let rightElement: HTMLElement
      if(elementsToMove.length == 0) {
        rightElement = this.newEmptyElementAfterBreak();
      } else {
        rightElement = document.createElement(this.tagName);
      }

      elementsToMove.forEach((elementToMove) => {
        //this.removeChild(elementToMove);
        rightElement.append(elementToMove);
      });

      this.parentNode.insertBefore(rightElement, this.nextSibling);
    }
  }

  newEmptyElementAfterBreak(): HTMLElement {
    let result = document.createElement(this.newEmptyElementNameAfterBreak());
    let textNode = document.createTextNode(''); //\u200b');
    result.appendChild(textNode);
    return result;
  }

  newEmptyElementNameAfterBreak(): string {
    return this.tagName;
  }




  pushBreakAndNodesAfterToParent(content: HTMLBRElement) {
    this.pushNodesAfterBreakToParent(content);
    this.parentNode?.insertBefore(content, this.nextSibling);
  }


  mergeWithPrevious(currentSelection: Selection | null) {
  }

  mergeNextIn() {
  }


  setSelectionToEnd(currentSelection: Selection | null) {
    var last: Node = this;
    while(last.lastChild != null) {
      last = last.lastChild;
    }
    if(last instanceof Text) {
      const range = document.createRange();
      range.setStart(last, last.length);
      range.collapse(true);
      currentSelection?.removeAllRanges();
      currentSelection?.addRange(range);
    }
  }


  getMarkdown(): string {
    return Array.from(this.children).map((child) => {
      if (isMarkdownElement(child)) {
        return child.getMarkdown();
      } else {
        return '';
      }
    }).join('');
  }
}

