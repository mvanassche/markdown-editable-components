import { html, customElement, property, css } from 'lit-element';
import { ContainerElement } from './abstract/container-element';

@customElement('markdown-numeric-list')
export class NumericList extends ContainerElement {
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
}
