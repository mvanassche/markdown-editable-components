import { html, customElement, property, css } from 'lit-element';
import { TerminalInlineElement } from './abstract/inline-element';

@customElement('markdown-image')
export class MarkdownImage extends TerminalInlineElement {
  mustBeDirectChildOfDocument = false;
  @property()
  destination: string = '';

  @property()
  override title: string = ''; // TODO make it optional

  static override styles = css`
    :host([destination]) .upload {
      display: none;
    }
    .upload {
      border: #c7c7c7 1px dashed;
      padding: 10px;
    }
  `;

  override render() {
    // TODO the alt innertext is not working
    return html`
      <input class='upload' type="file" @change="${this.upload}" accept="image/*">
      <img src="${this.destination}" title="${this.title}" alt="${this.innerText}" @error="${this.error}" part="image"/>
      <slot style='display:none;'></slot>
    `;
  }

  override getMarkdown(): string {
    return `![${this.innerText}](${this.destination} "${this.title}")`;
  }
  override containsMarkdownTextContent(): Boolean {
    return false;
  }
  override isDeletableAsAWhole(): boolean {
    return true;
  }

  error() {
    this.dispatchEvent(new CustomEvent('error-image', { detail: this.destination, bubbles: true, cancelable: true }));
  }

  upload() {
    let input = this.shadowRoot?.querySelector('.upload') as HTMLInputElement;
    let file = input?.files?.[0];
    if(file) {
      let fr = new FileReader();
      fr.onload = (data) => {
        this.setAttribute('destination', data.target?.result as string);
      };
      fr.readAsDataURL( file)
    }
  }

  setImageSrc(src: string) {
    let img = this.shadowRoot?.querySelector('img')
    if(img) img.src = src;
  }
  
}
