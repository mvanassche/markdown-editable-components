import { LitElement, html, customElement, css } from 'lit-element';
import { LeafElement } from './abstract/leaf-element';

@customElement('markdown-selection-actions')
export class SelectionActions extends LitElement {

  applyTo: LeafElement | null = null;

  static styles = css`
    :host {
      display: block;
      border: solid 1px gray;
      padding: 16px;
      max-width: 800px;
      position: fixed;
      z-index: 3;
    }
  `;

  render() {
    return html`
      <div>
        <div class="toolbar">
          <button @click=${this._title1}>Make title 1</button>
          <button @click=${this._title1Element}>Make title 1 element</button>
          <slot name="toolbar"></slot>
        </div>
        <slot></slot>
      </div>
    `;
  }

  _title1() {
    this.applyTo?.selectionToBlock('markdown-title-1');
  }

  _title1Element() {
    const element = document.createElement('markdown-title-1');

    Array.from(this.applyTo!.childNodes).forEach((child) => { element.append(child) });

    this.applyTo?.replaceWith(element);
  }
}
