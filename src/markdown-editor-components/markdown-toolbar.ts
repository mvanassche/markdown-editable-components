import { LitElement, html, customElement, css } from 'lit-element';
import { MarkdownEditor } from './markdown-editor';

@customElement('markdown-toolbar')
export class Toolbar extends LitElement {

  markdownEditor: MarkdownEditor | null = null;

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
    .toolbar {
      height: 24px;
      display: flex;
    }
  `;

  render() {
    return html`
      <div>
        <div class="toolbar">
          <toolbar-dropdown>
            Heading 1 ▾
            <dropdown-elements slot='dropdown-elements'>
              <dropdown-element @click=${this.header1Element}>
                <markdown-header-1>Heading 1</markdown-header-1>
              </dropdown-element>
              <dropdown-element @click=${this.header2Element}>
                <markdown-header-2>Heading 2</markdown-header-2>
              </dropdown-element>
              <dropdown-element @click=${this.header3Element}>
                <markdown-header-3>Heading 3</markdown-header-3>
              </dropdown-element>
              <dropdown-element @click=${this.header4Element}>
                <markdown-header-4>Heading 4</markdown-header-4>
              </dropdown-element>
              <dropdown-element @click=${this.header5Element}>
                <markdown-header-5>Heading 5</markdown-header-5>
              </dropdown-element>
              <dropdown-element @click=${this.header6Element}>
                <markdown-header-6>Heading 6</markdown-header-6>
              </dropdown-element>
              <dropdown-element @click=${this.pararaphElement}>
                <markdown-paragraph>Paragraph</markdown-paragraph>
              </dropdown-element>
            </dropdown-elements>
          </toolbar-dropdown>
          <toolbar-separator></toolbar-separator>
          <material-icon-button @click=${this.hello}>format_bold</material-icon-button>
          <material-icon-button @click=${this.hello}>format_italic</material-icon-button>
          <material-icon-button @click=${this.hello}>format_underlined</material-icon-button>
          <material-icon-button @click=${this.hello}>format_strikethrough</material-icon-button>
          <toolbar-separator></toolbar-separator>
          <material-icon-button @click=${this.hello}>format_align_left</material-icon-button>
          <material-icon-button @click=${this.hello}>format_align_right</material-icon-button>
          <material-icon-button @click=${this.hello}>format_align_center</material-icon-button>
          <material-icon-button @click=${this.hello}>format_indent_increase</material-icon-button>
          <material-icon-button @click=${this.hello}>format_indent_decrease</material-icon-button>
          <toolbar-separator></toolbar-separator>
          <material-icon-button @click=${this.hello}>format_list_bulleted</material-icon-button>
          <material-icon-button @click=${this.hello}>format_list_numbered</material-icon-button>
          <toolbar-separator></toolbar-separator>
          <material-icon-button @click=${this.hello}>format_quote</material-icon-button>
          <material-icon-button @click=${this.hello}>border_all</material-icon-button>
          <material-icon-button @click=${this.hello}>horizontal_rule</material-icon-button>
          <material-icon-button @click=${this.hello}>format_size</material-icon-button>
          <material-icon-button @click=${this.hello}>insert_photo</material-icon-button>
          <material-icon-button @click=${this.hello}>insert_link</material-icon-button>
          <material-icon-button @click=${this.hello}>code</material-icon-button>
          <toolbar-separator></toolbar-separator>
          <material-icon-button @click=${this.hello}>content_copy</material-icon-button>
          <material-icon-button @click=${this.hello}>content_cut</material-icon-button>
          <material-icon-button @click=${this.hello}>content_paste</material-icon-button>
          <toolbar-separator></toolbar-separator>
          <material-icon-button @click=${this.hello}>check_box</material-icon-button>
          <material-icon-button @click=${this.hello}>clear</material-icon-button>
          <slot name="toolbar"></slot>
        </div>
        <slot></slot>
      </div>
    `;
  }

  setMarkdownEditor(markdownEditor: MarkdownEditor) {
    this.markdownEditor = markdownEditor;
  }

  hello() {
    console.log(this.markdownEditor?.markdownDocument?.getCurrentLeafBlock());
  }

  firstUpdated() {
  }

  header1Element() {
    const element = document.createElement('markdown-header-1');
    const oldElement = this.markdownEditor?.markdownDocument?.getCurrentLeafBlock();

    if (oldElement != null) {
      element.innerHTML = oldElement.innerHTML;
      oldElement.replaceWith(element);
    }
  }

  header2Element() {
    const element = document.createElement('markdown-header-2');
    const oldElement = this.markdownEditor?.markdownDocument?.getCurrentLeafBlock();

    if (oldElement != null) {
      element.innerHTML = oldElement.innerHTML;
      oldElement.replaceWith(element);
    }
  }

  header3Element() {
    const element = document.createElement('markdown-header-3');
    const oldElement = this.markdownEditor?.markdownDocument?.getCurrentLeafBlock();

    if (oldElement != null) {
      element.innerHTML = oldElement.innerHTML;
      oldElement.replaceWith(element);
    }
  }

  header4Element() {
    const element = document.createElement('markdown-header-4');
    const oldElement = this.markdownEditor?.markdownDocument?.getCurrentLeafBlock();

    if (oldElement != null) {
      element.innerHTML = oldElement.innerHTML;
      oldElement.replaceWith(element);
    }
  }

  header5Element() {
    const element = document.createElement('markdown-header-5');
    const oldElement = this.markdownEditor?.markdownDocument?.getCurrentLeafBlock();

    if (oldElement != null) {
      element.innerHTML = oldElement.innerHTML;
      oldElement.replaceWith(element);
    }
  }

  header6Element() {
    const element = document.createElement('markdown-header-6');
    const oldElement = this.markdownEditor?.markdownDocument?.getCurrentLeafBlock();

    if (oldElement != null) {
      element.innerHTML = oldElement.innerHTML;
      oldElement.replaceWith(element);
    }
  }

  pararaphElement() {
    const element = document.createElement('markdown-paragraph');
    const oldElement = this.markdownEditor?.markdownDocument?.getCurrentLeafBlock();

    if (oldElement != null) {
      element.innerHTML = oldElement.innerHTML;
      oldElement.replaceWith(element);
    }
  }
}
