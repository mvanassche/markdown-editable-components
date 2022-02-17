import { LitElement, html, customElement, css } from 'lit-element';
import { MarkdownDocument } from './markdown-document';
import { ToggleToolbarButton } from './toolbar-buttons/toggle-toolbar-button';

@customElement('markdown-toolbar')
export class Toolbar extends LitElement {

  markdownDocument: MarkdownDocument | null = null;
  boldButton: ToggleToolbarButton | null = null;
  italicButton: ToggleToolbarButton | null = null;
  strikeButton: ToggleToolbarButton | null = null;
  dropdownTitle: Element | null = null;

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
    :host(.focus-disabled:hover) {
      opacity: 1.0;
    }
    :host {
      display: block;
      border: solid 1px gray;
      padding: 5px;
    }
    :host(.focus-disabled) {
      opacity: 0.1;
    }
    .toolbar {
      height: 24px;
      display: flex;
    }
    .looks-like-header1 {
      font-size: var(--header1-font-size);
      font-weight: bold;
    }
    .looks-like-header2 {
      font-size: var(--header2-font-size);
      font-weight: bold;
    }
    .looks-like-header3 {
      font-size: var(--header3-font-size);
      font-weight: bold;
    }
    .looks-like-header4 {
      font-size: var(--header4-font-size);
      font-weight: bold;
    }
    .looks-like-header5 {
      font-size: var(--header5-font-size);
      font-weight: bold;
    }
    .looks-like-header6 {
      font-size: var(--header6-font-size);
      font-weight: bold;
    }
  `;

  render() {
    return html`
      <div>
        <div class="toolbar">
          <toolbar-dropdown>
            <span class='dropdown-title'>Heading 1</span> ▾
            <dropdown-elements slot='dropdown-elements'>
              <dropdown-element @mousedown=${this.header1Element}>
                <div class='looks-like-header1'>Heading 1</div>
              </dropdown-element>
              <dropdown-element @mousedown=${this.header2Element}>
                <div class='looks-like-header2'>Heading 2</div>
              </dropdown-element>
              <dropdown-element @mousedown=${this.header3Element}>
                <div class='looks-like-header3'>Heading 3</div>
              </dropdown-element>
              <dropdown-element @mousedown=${this.header4Element}>
                <div class='looks-like-header4'>Heading 4</div>
              </dropdown-element>
              <dropdown-element @mousedown=${this.header5Element}>
                <div class='looks-like-header5'>Heading 5</div>
              </dropdown-element>
              <dropdown-element @mousedown=${this.header6Element}>
                <div class='looks-like-header6'>Heading 6</div>
              </dropdown-element>
              <dropdown-element @mousedown=${this.pararaphElement}>
                <markdown-paragraph>Paragraph</markdown-paragraph>
              </dropdown-element>
            </dropdown-elements>
          </toolbar-dropdown>

          <toolbar-separator></toolbar-separator>

          <toggle-toolbar-button title='toggle bold' class='bold' @click=${this.boldButtonClick}>format_bold</toggle-toolbar-button>
          <toggle-toolbar-button title='toggle italic' class='italic' @click=${this.italicButtonClick}>format_italic</toggle-toolbar-button>
          <toggle-toolbar-button title='toggle strike' class='strike' @click=${this.strikeButtonClick}>format_strikethrough</toggle-toolbar-button>
          <!--toolbar-button @click=${this.underlineButtonClick}>
            <material-icon>format_underlined</material-icon>
          </toolbar-button-->

          <toolbar-separator></toolbar-separator>

          <!--toolbar-button>
            <material-icon>format_align_left</material-icon>
          </toolbar-button>
          <toolbar-button>
            <material-icon>format_align_right</material-icon>
          </toolbar-button>
          <toolbar-button>
            <material-icon>format_align_center</material-icon>
          </toolbar-button>
          <toolbar-button>
            <material-icon>format_indent_increase</material-icon>
          </toolbar-button>
          <toolbar-button>
            <material-icon>format_indent_decrease</material-icon>
          </toolbar-button>

          <toolbar-separator></toolbar-separator-->

          <toolbar-button @click=${this.listBulletedClick}>
            <material-icon title='list'>format_list_bulleted</material-icon>
          </toolbar-button>
          <toolbar-button @click=${this.listNumericClick}>
            <material-icon title='numbered list'>format_list_numbered</material-icon>
          </toolbar-button>

          <toolbar-separator></toolbar-separator>

          <toolbar-button @click=${this.codeButtonClick}>
            <material-icon title='code inline'>format_quote</material-icon>
          </toolbar-button>
          <!--toolbar-button>
            <material-icon>border_all</material-icon>
          </toolbar-button-->
          <toolbar-button @click=${this.breakButtonClick}>
            <material-icon title='break'>horizontal_rule</material-icon>
          </toolbar-button>
          <!--toolbar-button>
            <material-icon>format_size</material-icon>
          </toolbar-button-->

          <toolbar-button @click=${this.insertPhotoButtonClick}>
            <material-icon title='insert image'>insert_photo</material-icon>
            <!--dropdown-elements slot='dropdown-elements' id='insert-photo'>
              URL: <input type="text" class="insert-photo-url">
              Description: <input type="text" class="insert-photo-text">
              <button @click=${this.insertPhotoButtonClick}>Insert</button>
            </dropdown-elements-->
          </toolbar-button>

          <toolbar-button @click=${this.insertLinkButtonClick}>
            <material-icon title='insert link'>insert_link</material-icon>
            <!--dropdown-elements slot='dropdown-elements' id='insert-link'>
              URL: <input type="text" class="insert-link-url">
              Text: <input type="text" class="insert-link-text">
              <button @click=${this.insertLinkButtonClick}>Insert</button>
            </dropdown-elements-->
          </toolbar-button>

          <toolbar-button @click=${this.codeBlockButtonClick}>
            <material-icon title='insert code block'>code</material-icon>
          </toolbar-button>

          <toolbar-separator></toolbar-separator>

          <!--toolbar-button>
            <material-icon>content_copy</material-icon>
          </toolbar-button>
          <toolbar-button>
            <material-icon>content_cut</material-icon>
          </toolbar-button>
          <toolbar-button>
            <material-icon>content_paste</material-icon>
          </toolbar-button>

          <toolbar-separator></toolbar-separator>

          <toolbar-button>
            <material-icon>check_box</material-icon>
          </toolbar-button>
          <toolbar-button>
            <material-icon>clear</material-icon>
          </toolbar-button-->

          <slot name="toolbar"></slot>
        </div>
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener('mousedown', (e) => {
      // e;
      e.preventDefault();
      // console.log('mousesdown');
    });
  }

  insertPhotoButtonClick() {
    //const photoURLInput = this.shadowRoot?.querySelector('input.insert-photo-url') as HTMLInputElement;
    //const photoTextInput = this.shadowRoot?.querySelector('input.insert-photo-text') as HTMLInputElement;

    this.markdownDocument?.insertPhoto(null, null);
  }

  insertLinkButtonClick() {
    //const linkURLInput = this.shadowRoot?.querySelector('input.insert-link-url') as HTMLInputElement;
    //const linkTextInput = this.shadowRoot?.querySelector('input.insert-link-text') as HTMLInputElement;

    this.markdownDocument?.insertLink(); //linkURLInput.value, linkTextInput.value);
  }

  firstUpdated() {
    this.shadowRoot?.querySelector('dropdown-elements#insert-link')?.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      // e.preventDefault();
    }, false);

    this.shadowRoot?.querySelector('dropdown-elements#insert-photo')?.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      // e.preventDefault();
    }, false);

    this.boldButton = this.shadowRoot?.querySelector('.bold') as ToggleToolbarButton;
    this.italicButton = this.shadowRoot?.querySelector('.italic') as ToggleToolbarButton;
    this.strikeButton = this.shadowRoot?.querySelector('.strike') as ToggleToolbarButton;

    // TODO: make controller for the toolbar-dropdown
    const dropdownTitle = this.shadowRoot?.querySelector('.dropdown-title');
    if (dropdownTitle) {
      this.dropdownTitle = dropdownTitle;
    }
  }

  setMarkdownDocument(markdownDocument: MarkdownDocument) {
    this.markdownDocument = markdownDocument;
  }

  header1Element() {
    // console.log('Hello');
    this.markdownDocument?.header1Element();
  }

  header2Element() {
    this.markdownDocument?.header2Element();
  }

  header3Element() {
    this.markdownDocument?.header3Element();
  }

  header4Element() {
    this.markdownDocument?.header4Element();
  }

  header5Element() {
    this.markdownDocument?.header5Element();
  }

  header6Element() {
    this.markdownDocument?.header6Element();
  }

  pararaphElement() {
    this.markdownDocument?.pararaphElement();
  }

  codeBlockButtonClick() {
    this.markdownDocument?.makeCodeBlock();
  }

  boldButtonClick() {
    if(this.boldButton) {
      if(this.boldButton.highlighted) {
        this.markdownDocument?.removeBold();
      } else {
        this.markdownDocument?.makeBold();
      }
    }
  }

  italicButtonClick() {
    if(this.italicButton) {
      if(this.italicButton.highlighted) {
        this.markdownDocument?.removeItalic();
      } else {
        this.markdownDocument?.makeItalic();
      }
    }
  }

  underlineButtonClick(e: MouseEvent) {
    // e.preventDefault();
    e;
    // console.log(this.markdownEditor?.currentSelection);
    this.markdownDocument?.makeUnderline();
  }

  strikeButtonClick() {
    if(this.strikeButton) {
      if(this.strikeButton.highlighted) {
        this.markdownDocument?.removeStrike();
      } else {
        this.markdownDocument?.makeStrike();
      }
    }
  }

  codeButtonClick(e: MouseEvent) {
    // e.preventDefault();
    e;
    // console.log(this.markdownEditor?.currentSelection);
    this.markdownDocument?.makeCodeInline();
  }

  breakButtonClick(e: MouseEvent) {
    // e.preventDefault();
    e;
    // console.log(this.markdownEditor?.currentSelection);
    this.markdownDocument?.makeBreak();
  }

  listBulletedClick(e: MouseEvent) {
    // e.preventDefault();
    e;
    // console.log(this.markdownEditor?.currentSelection);
    this.markdownDocument?.listBulletedClick();
  }

  listNumericClick(e: MouseEvent) {
    // e.preventDefault();
    e;
    // console.log(this.markdownEditor?.currentSelection);
    this.markdownDocument?.listNumericClick();
  }

  highlightBoldButton() {
    if (this.boldButton) {
      this.boldButton.highlighted = true;
    }
  }

  removeBoldButtonHighlighting() {
    if (this.boldButton) {
      this.boldButton.highlighted = false;
    }
  }

  highlightItalicButton() {
    if (this.italicButton) {
      this.italicButton.highlighted = true;
    }
  }

  removeItalicButtonHighlighting() {
    if (this.italicButton) {
      this.italicButton.highlighted = false;
    }
  }

  highlightStrikeButton() {
    if (this.strikeButton) {
      this.strikeButton.highlighted = true;
    }
  }

  removeBoldStrikeHighlighting() {
    if (this.strikeButton) {
      this.strikeButton.highlighted = false;
    }
  }


  setDropdownTitle(newTitle: string) {
    if (this.dropdownTitle) {
      this.dropdownTitle.innerHTML = newTitle;
    }
  }
}
