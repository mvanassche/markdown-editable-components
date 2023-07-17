import { html, customElement, property, css } from 'lit-element';
import { ListItem } from './markdown-list-item';

@customElement('markdown-task-list-item')
export class TaskListItem extends ListItem {
  @property({
    type: Boolean,
    converter: { 
      fromAttribute: (value: any) => { return value == 'true' },
      toAttribute: (value: Boolean) => { return value != null ? value?.valueOf() : false }
    }
  })
  checked: Boolean = false

  // TODO reuse inherit from list item
  static override styles = css`
    :host {
      position: relative;
      left: 20px;
    }
    .item-container {
      padding-left: 20px;
    }
    input {
      position: absolute;
      z-index: 3;
      /*left: 15px;*/
    }
    .task-and-container {
      display: inline;
    }
  `;

  override render() {
    return html`
      <div class='task-and-container'>
        <input type='checkbox' @change=${this._selection}/>
        <div class='item-container'><slot></slot></div>
      </div>
  `;
  }

  _selection(e: Event) {
    this.setAttribute('checked', (e.target as HTMLInputElement).checked + '');
  }

  override firstUpdated(changedProperties: Map<string, string>) { 
    if (changedProperties.has('checked')) {
      (this.shadowRoot!.querySelector('input') as HTMLInputElement).checked = this.checked.valueOf();
    }
   }

  override getTaskMarkdown(): string { return '[' + (this.checked ? 'x' : ' ') + '] ' }
}
