import { LitElement, html, customElement, property, css } from 'lit-element';
import { Heading } from './abstract/heading';
import { MarkdownElement } from './interfaces/markdown-element';
import { MarkdownDocument } from './markdown-document';

@customElement('markdown-toc')
export class TableOfContent extends LitElement implements MarkdownElement {
  @property({ attribute: false })
  markdownDocument: MarkdownDocument | null = null;

  static styles = css`
    :host {
      display: block;
    }
    :host(.floating) {
      position: absolute;
      right: 0px;
      top: 0px;
    }
    :host(.floating) .level-2 {
      height: 0px;
      visibility: collapse;
    }
    :host(.floating:hover) .level-2 {
      height: auto;
      visibility: visible;
    }
    .level {
      padding-left: 10px;
    }
    .level a {
      display: block;
    }
    .level {
      font-size: 0.9em;
    }
  `;

  render() {
    return html`
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.markdownDocument) {
      this.markdownDocument = this.closest('markdown-document');
      setTimeout(() => this.refresh(), 1000); // TODO base this on some loaded event + change events
    }
  }

  updated(changedProperties: Map<string, string>) { 
    if (changedProperties.has('markdownDocument')) {
      this.refresh();
    }
  }

  refresh() {
    if (this.markdownDocument != null) {
      this.shadowRoot!.innerHTML = '';

      const headings = Array.from(this.markdownDocument.querySelectorAll('*')).filter((element) => element instanceof Heading) as Heading[];

      let currentDepth = 1;
      let currentList = document.createElement("div");
      //var currentItem
      this.shadowRoot?.append(currentList);

      headings.forEach((heading) => {
        const a = document.createElement('a');
        a.href = '#' + heading.id;
        a.innerHTML = heading.innerHTML;
        a.onclick = () => heading.scrollIntoView();
  
        while (currentDepth < heading.depth) {
          currentDepth++;
          const nextList = document.createElement("div");
          nextList.classList.add("level");
          nextList.classList.add("level-" + currentDepth);
          currentList.appendChild(nextList);
          currentList = nextList;
        }

        while (currentDepth > heading.depth) {
          currentDepth--;
          currentList = (currentList.parentElement as HTMLDivElement);
        }

        currentList.append(a);
      });
    }
  }

  getMarkdown(): string {
    return '${toc}';
  }
}
