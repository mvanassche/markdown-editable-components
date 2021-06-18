import { html, customElement, property, css } from 'lit-element';
import { ContainerElement } from './abstract/container-element';

@customElement('markdown-list')
export class List extends ContainerElement {
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
    return html`
      <slot></slot>
  `;
  }

  connectedCallback() {
    super.connectedCallback();
  }
}
