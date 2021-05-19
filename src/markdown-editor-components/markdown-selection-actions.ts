import { LitElement, html, customElement, css } from 'lit-element';
import { LeafElement } from '../markdown-components/abstract/leaf-element';

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
          <button @click=${this._header1}>Make header 1</button>
          <button @click=${this._header1Element}>Make header 1 element</button>
          <slot name="toolbar"></slot>
        </div>
        <slot></slot>
      </div>
    `;
  }

  _header1() {
    this.applyTo?.selectionToBlock('markdown-header-1');
  }

  _header1Element() {
    const element = document.createElement('markdown-header-1');

    Array.from(this.applyTo!.childNodes).forEach((child) => { element.append(child) });

    this.applyTo?.replaceWith(element);
  }
}
