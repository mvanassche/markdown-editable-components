import { html, customElement, property, css } from 'lit-element';
import { MarkdownElementWithLevel } from '../markdown-components';
import { ContainerElement } from './abstract/container-element';

@customElement('markdown-numeric-list')
export class NumericList extends ContainerElement implements MarkdownElementWithLevel {
  @property({ type: Boolean })
  ordered?: boolean // change to different  widget???

  @property({ type: Number })
  start?: number

  @property({ type: Boolean })
  spread?: boolean

  static styles = css`
    :host {
      list-style-type: decimal;
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
    return false;
  }
  goDownOneLevel(child: Element | null): void {
    if(child) {
      const list = document.createElement('markdown-numeric-list');
      const item = document.createElement('markdown-numeric-list-item');
  
      item.innerHTML = child.innerHTML;
      list.appendChild(item);
      child.innerHTML= '&nbsp';
      child.appendChild(list);  
    }
  
  }
  goUpOneLevel(child: Element | null): void {
    if(child) {
      let nextUp = this.parentElement?.closest('markdown-numeric-list-item');
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
