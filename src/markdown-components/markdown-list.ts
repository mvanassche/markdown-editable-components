import { html, customElement, property, css } from 'lit-element';
import { ContainerElement } from './abstract/container-element';
import { MarkdownElementWithLevel } from '../markdown-components';


@customElement('markdown-list')
export class List extends ContainerElement implements MarkdownElementWithLevel { 
  mustBeDirectChildOfDocument = false; // ???
  
  @property({ type: Boolean })
  ordered?: boolean // change to different  widget???

  @property({ type: Number })
  start?: number

  @property({ type: Boolean })
  spread?: boolean

  static styles = css`
    :host {
      counter-reset: section;
    }
    /*:host([ordered='true']) > ::slotted(*) {
      background-color : red;
    }*/
    /*:host([ordered='true']) ::slotted(*)::before {
      counter-increment: section;
      content: counter(section) ".";
      position: absolute;
    }*/
    :host ::slotted(*) {
      /*position: absolute;*/
      display: list-item;
    }
    :host([ordered='true']) ::slotted(*) {
      list-style-type: decimal;
    }
  `;

  render() {
    return html`<slot></slot>`;
  }

  connectedCallback() {
    super.connectedCallback();
  }
  getMarkdown(): string {
    return super.getMarkdown() + '\n';
  }
  containsMarkdownTextContent(): Boolean {
    return true;
  }

  goDownOneLevel(child: Element | null): void {
    if(child) {
      const list = document.createElement('markdown-list');
      const item = document.createElement('markdown-list-item');
  
      item.innerHTML = child.innerHTML;
      list.appendChild(item);
      child.innerHTML= '&nbsp';
      child.appendChild(list);  
    }
  
  }
  goUpOneLevel(child: Element | null): void {
    if(child) {
      let nextUp = this.parentElement?.closest('markdown-list-item');
      if(nextUp) {
        let indexOfChild = Array.from(this.childNodes).indexOf(child);
        for (let j = indexOfChild; j < this.childNodes.length; j++) {
          nextUp.after(this.childNodes[j]);
        }
        //nextUp.after(child);
      }
    }
  }

}
