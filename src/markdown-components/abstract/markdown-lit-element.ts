import { LitElement } from 'lit-element';
import { isMarkdownElement } from '../functions';
import { MarkdownElement } from '../interfaces/markdown-element';

export abstract class MarkdownLitElement extends LitElement implements MarkdownElement {

  isEditable(): boolean {
    return true;
  }

  // returns a boolean that if true, it means that the element changed something that will impact a ancestor, so normalize should be redone
  normalizeContent(): boolean {
    for (let i = 0; i < this.childNodes.length; i++) {
      const content = this.childNodes[i];
      if(content instanceof MarkdownLitElement) {
        if(content.normalizeContent()) {
          return this.normalizeContent();
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
      }
      let rightElement: HTMLElement
      if(elementsToMove.length == 0) {
        rightElement = this.newEmptyElementAfterBreak();
      } else if(elementsToMove.length == 1 && elementsToMove[0] instanceof Text && elementsToMove[0].textContent == '\u200b') {
        rightElement = document.createElement(this.newEmptyElementNameAfterBreak());
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

  newEmptyElement(tagName: string): HTMLElement {
    let result = document.createElement(tagName);
    if(result instanceof MarkdownLitElement) {
      result.fillEmptyElement();
    }
    return result;
  }

  fillEmptyElement() {
    let textNode = document.createTextNode('\u200b'); // put in a whitespace to avoid the issue of being inaccessible when empty
    this.appendChild(textNode);
  }


  newEmptyElementAfterBreak(): HTMLElement {
    return this.newEmptyElement(this.newEmptyElementNameAfterBreak());
  }

  newEmptyElementNameAfterBreak(): string {
    return this.tagName;
  }




  pushBreakAndNodesAfterToParent(content: HTMLBRElement) {
    this.pushNodesAfterBreakToParent(content);
    this.parentNode?.insertBefore(content, this.nextSibling);
  }


  mergeWithPrevious(_: Selection | null) {
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

  contentLength(): number {
    var result = 0;
    Array.from(this.childNodes).forEach((child) => {
      if(child instanceof MarkdownLitElement) {
        result += child.contentLength();
      } else if(child instanceof HTMLBRElement) {
        result++;
      } else {
        // TODO remove special chars like zerowidth
        result += child.textContent?.replace('\u200b', '')?.length ?? 0;
      }
    });
    return result + this.endOfLineEquivalentLength();
  }

  contentLengthUntil(child: ChildNode): number {
    const childNodes = Array.from(this.childNodes);
    const indexOfChild = childNodes.indexOf(child);
    var result = 0;
    if(indexOfChild >= 0) {
      childNodes.slice(0, indexOfChild).forEach((child) => {
        if(child instanceof MarkdownLitElement) {
          result += child.contentLength();
        } else if(child instanceof HTMLBRElement) {
          result++;
        } else {
          result += child.textContent?.replace('\u200b', '')?.length ?? 0;
        }
      });
    }
    return result;
  }


  elementEndWithEndOfLineEquivalent(): boolean {
    return false;
  }

  endOfLineEquivalentLength(): number {
    if(this.elementEndWithEndOfLineEquivalent()) {
      return 1;
    } else {
      return 0;
    }
  }

  getNodeAndOffsetFromContentOffset(contentOffset: number): [Node, number] {
    if(this.childNodes.length > 0) {
      var resultNode = this.childNodes[0];
      var previousNodeWasEol = false;
        // keep the first that will fit the offset
      for (let i = 0; i < this.childNodes.length; i++) {
        let child = this.childNodes[i];
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

