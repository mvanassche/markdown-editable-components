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
      const rightElement = document.createElement(this.tagName);

      let indexOfBreak = Array.from(this.childNodes).indexOf(content);
      for (let j = indexOfBreak + 1; j < this.childNodes.length; j++) {
        elementsToMove.push(this.childNodes[j]);
      }

      elementsToMove.forEach((elementToMove) => {
        //this.removeChild(elementToMove);
        rightElement.append(elementToMove);
      });

      this.parentNode.insertBefore(rightElement, this.nextSibling);
    }
  }

  pushBreakAndNodesAfterToParent(content: HTMLBRElement) {
    this.pushNodesAfterBreakToParent(content);
    this.parentNode?.insertBefore(content, this.nextSibling);
  }


  mergeWithPrevious() {
  }

  mergeNextIn() {
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