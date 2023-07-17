import { MarkdownLitElement } from "./markdown-lit-element";

export abstract class ContainerElement extends MarkdownLitElement {


    override contentLength(): number {
        var result = 0;
        Array.from(this.childNodes).forEach((child) => {
          if(child instanceof MarkdownLitElement) {
            result += child.contentLength();
          }
        });
        return result + this.endOfLineEquivalentLength();
      }
    
      override contentLengthUntil(child: ChildNode): number {
        const childNodes = Array.from(this.childNodes);
        const indexOfChild = childNodes.indexOf(child);
        var result = 0;
        if(indexOfChild >= 0) {
          childNodes.slice(0, indexOfChild).forEach((child) => {
            if(child instanceof MarkdownLitElement) {
              result += child.contentLength();
            }
          });
        }
        return result;
      }
    

    override elementEndWithEndOfLineEquivalent(): boolean {
        return (this.children.length > 0);
      }

}
