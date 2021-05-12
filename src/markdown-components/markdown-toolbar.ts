import { LitElement, html, customElement, css } from 'lit-element';
import { MarkdownDocument } from './markdown-document';

@customElement('markdown-toolbar')
export class Toolbar extends LitElement {

  applyTo: MarkdownDocument | null = null;

  static styles = css`
    @font-face {
      font-family: 'Material Icons';
      font-style: normal;
      font-weight: 400;
      src: url(https://fonts.gstatic.com/s/materialicons/v70/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2) format('woff2');
    }
    .material-icons {
      font-family: 'Material Icons';
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      font-feature-settings: 'liga';
      -moz-font-feature-settings: 'liga';
      -moz-osx-font-smoothing: grayscale;
    }
    :host {
      display: block;
      border: solid 1px gray;
      padding: 16px;
    }
  `;


  render() {
    return html`
      <div>
        <div class="toolbar">
          <button @click=${this._title1Element}>Make title 1 element</button>
          <i class="material-icons">check_box</i>
          <i class="material-icons">format_bold</i>
          <i class="material-icons">format_italic</i>
          <i class="material-icons">format_underlined</i>
          <i class="material-icons">format_align_left</i>
          <i class="material-icons">format_align_right</i>
          <i class="material-icons">format_align_center</i>
          <i class="material-icons">format_indent_increase</i>
          <i class="material-icons">format_indent_decrease</i>
          <i class="material-icons">format_list_bulleted</i>
          <i class="material-icons">format_list_numbered</i>
          <i class="material-icons">format_quote</i>
          <i class="material-icons">format_strikethrough</i>
          <i class="material-icons">border_all</i>
          <i class="material-icons">horizontal_rule</i>
          <i class="material-icons">format_size</i>
          <i class="material-icons">insert_photo</i>
          <i class="material-icons">insert_link</i>
          <i class="material-icons">code</i>
          <i class="material-icons">clear</i>
          <i class="material-icons">content_copy</i>
          <i class="material-icons">content_cut</i>
          <i class="material-icons">content_paste</i>
          <slot name="toolbar"></slot>
        </div>
        <slot></slot>
      </div>
    `;
  }

  firstUpdated() {
    let parent = this.parentNode;

    while (parent != null && parent != document && !(parent instanceof MarkdownDocument)) {
      parent = parent?.parentNode;
    }

    if (parent instanceof MarkdownDocument) {
      this.applyTo = parent;
    }
  }

  _title1Element() {
    const element = document.createElement('markdown-title-1');
    const oldElement = this.applyTo!.getCurrentLeafBlock();

    if (oldElement != null) {
      Array.from(oldElement.childNodes).forEach((child) => { element.append(child) });
      oldElement.replaceWith(element);
    }
  }
}
