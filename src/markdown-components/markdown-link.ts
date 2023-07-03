import { html, customElement, property, css } from 'lit-element';
//import { MarkdownDocument } from '../markdown-editor-components';
import { TerminalInlineElement } from './abstract/inline-element';

@customElement('markdown-link')
export class MarkdownLink extends TerminalInlineElement {
  mustBeDirectChildOfDocument = false;
  
  @property()
  destination: string = '';

  @property()
  title: string = ''; // TODO make it optional

  static styles = css`
        :host {
          position: relative;
        }
        .show-link {
          user-select: none;
          position: absolute;
          background: white;
          padding: 3px;
          top: -8px;
          right: -20px;
          cursor: default;
          opacity: 0.0;
          transition: opacity 1s ease-in-out;
        }
        :host(:hover) .show-link, :host(.fresh) .show-link {
          opacity: 1.0;
        }
        /*:host(.fresh) .destination-input {
          display: block;
        }*/
        .destination-input.visible {
          display: block;
        }
        .destination-input {
          display: none;
          position: absolute;
          z-index: 10;
          top: -15px;
          left: 15px;
          box-shadow: 0px 0px 5px 2px rgb(0 0 0 / 50%);
        }
  `;

  render() {
    return html`<a href="${this.destination}" title="${this.title}" part="anchor"><slot></slot></a><span class='show-link' @click=${this.destinationShow}>✎</span><input placeholder='http://' class='destination-input' value="${this.destination}" @input='${this.destinationInput}' @blur='${this.destinationHide}' @keydown='${this.destinationKey}'/>`;
  }

  connectedCallback() {
    super.connectedCallback();
    setTimeout(() => this.classList.remove('fresh'), 5000);
  }

  firstUpdated() {
    this.updateLinkTarget();
  }

  updateLinkTarget() {
    // if the link is local, then we can do it in the same window, if external, then need to go in blank tab.
    let a = this.shadowRoot!.querySelector('a')!;
    if(this.destination.startsWith('#')) {
      a.target = '_self';
    } else {
      a.target = '_blank';
    }

    a.onclick = (e: Event) => {
      let continueDefault = this.dispatchEvent(new CustomEvent('link-click', { detail: this.destination, bubbles: true, cancelable: true }));
      if(!continueDefault) {
        e.preventDefault();
      }
    };

    /*let doc = this.closest('markdown-document');
    if(doc != null && doc instanceof MarkdownDocument && doc.onLinkClick != null) {
      a.onclick = () => { doc!.onLinkClick?.call(this, this.destination); };
    }*/
  }

  destinationInput() {
    let input = this.shadowRoot!.querySelector('input')!;
    this.destination = input.value;
    this.updateLinkTarget();
  }
  destinationHide() {
    let input = this.shadowRoot!.querySelector('input')!;
    this.classList.remove('fresh');
    input.classList.remove('visible');
  }
  destinationShow() {
    let input = this.shadowRoot!.querySelector('input')!;
    input.classList.add('visible');
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }
  destinationKey(e: KeyboardEvent) {
    if(e.key === 'Enter') {
      (e.target as HTMLElement).blur();
    }
  }

  newEmptyElementNameAfterBreak() {
    // after a link, we typically want a paragraph!
    return null;
  }

  getMarkdown(): string {
    if(this.title) {
      return `[${this.innerText}](${this.destination} "${this.title}")`;
    } else {
      return `[${this.innerText}](${this.destination})`;
    }
  }
  containsMarkdownTextContent(): Boolean {
    return true;
  }
}

