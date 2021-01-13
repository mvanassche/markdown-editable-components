

import {LitElement, html, customElement, property, css} from 'lit-element';
//import { md } from './markdown-it-renderer';
//import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { md } from './marked-renderer';

/*
inspiration:
  https://github.github.com/gfm/
  https://spec.commonmark.org/0.29/
  https://github.com/syntax-tree/mdast
*/


/**
 * @slot - This element has a slot
 */

@customElement('markdown-document')
export class Document extends LitElement {
  static styles = css`
    :host {
      display: block;
      border: solid 1px gray;
      padding: 16px;
    }
    .toolbar {
      position: absolute;
      z-index: 3;
      top: 0px;
      right: 10%;
    }
  `;


  render() {
    return html`
      <div>
        <div class="toolbar">
          <slot name="toolbar"></slot>
        </div>
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("contenteditable", "true");
  }

  @property()
  get markdown() { return this.getMarkdown(); }
      
  set markdown(markdown: string) { this.renderMarkdown(markdown) }

  updated(changedProperties: Map<string, string>) { 
    if(changedProperties.has('markdown') && this.markdown != null) {
      this.renderMarkdown(this.markdown);
    }
   }

  public renderMarkdown(markdown: string) {
    this.innerHTML = md.parse(markdown);
  }

  public getMarkdown(): string {
    return Array.from(this.children).map((child) => {
      if(child instanceof MarkdownElement) {
        return child.getMarkdown();
      } else {
        return "";
      }
    }).join('');
  }

  public getCurrentLeafBlock(): LeafElement | null {
    var anchorNode = document.getSelection()?.anchorNode;
    if(anchorNode != null) {
      var element: Node | null = anchorNode;
      while(element != null && element != document && !(element instanceof Document)) { 
        if(element instanceof LeafElement) {
          return element;
        }
        element = element?.parentNode;
      }
    }
    return null;
  }

}

abstract class MarkdownElement extends LitElement {
  getMarkdown(): string {
    return Array.from(this.children).map((child) => {
      if(child instanceof MarkdownElement) {
        return child.getMarkdown();
      } else {
        return '';
      }
    }).join('');
  }
}

abstract class InlineElement extends MarkdownElement {
  connectedCallback() {
    super.connectedCallback();
    //this.setAttribute("contenteditable", "true");
  }
  getMarkdown(): string {
    return Array.from(this.childNodes).map((child) => {
      if(child instanceof MarkdownElement) {
        return child.getMarkdown();
      } else {
          return child.textContent;
      }
    }).join('');
  }
 } 

abstract class BlockElement extends MarkdownElement {

}

abstract class ContainerElement extends MarkdownElement {

}


abstract class LeafElement extends BlockElement {

  selection = false;

  selectionToBlock(elementName: string) {
    var selection = document.getSelection()!;
    var selection_text = selection.toString();

    var element = document.createElement(elementName);
    element.textContent = selection_text;

    var range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(element);
    this.normalizeChildren();
  }

  normalizeChildren() {
    var changed = false;
    do {
      var currentChanged = false;
      for (let i = 0; i < this.childNodes.length; i++) {
        let content = this.childNodes[i];
        if(content instanceof HTMLDivElement) {
          content.remove();
          let next = document.createElement(this.tagName);
          next.innerText = content.innerText;
          this.parentNode?.insertBefore(next, this.nextSibling);
          //this.parentElement?.append(next);
          currentChanged = true;
          break;
        } else if(content instanceof LeafElement) {
          // if there is something right of selection, add sibling
          if(i < this.childNodes.length - 1 && !(i + 1 == this.childNodes.length - 1 && this.childNodes[i + 1]?.nodeValue?.replace(/\s/g, '').length == 0)) {
            let next = document.createElement(this.tagName);
            while(i + 1 < this.childNodes.length) {
              next.append(this.childNodes[i + 1]);
            }
            content.remove();
            this.parentNode?.insertBefore(next, this.nextSibling);
            this.parentNode?.insertBefore(content, this.nextSibling);
            //this.parentElement?.append(content);
            //this.parentElement?.append(next);
            (next as LeafElement).normalizeChildren();
          } else {
            content.remove();
            this.parentNode?.insertBefore(content, this.nextSibling);
            //this.parentElement?.append(content);
            // no need to break or change, we are done here
          }
        }
      }
      changed = currentChanged;  
    } while(changed)
    /*Array.from(this.children).forEach((content) => {
      if(content instanceof HTMLDivElement) {
        content.remove();
        let next = document.createElement(this.tagName);
        next.innerText = content.innerText;
        this.parentElement?.append(next);
      }
      if(content instanceof LeafElement) {
        // if there is something right of selection, add sibling
        if(content.nextSibling != null) {
          let next = document.createElement(this.tagName);
          next.innerText = content.nextSibling.innerText;
        }
        content.remove();
        this.parentElement?.append(content);
        this.parentElement?.append(next);
      }  
    });*/
  }

  firstUpdated() {
    this.setupSelectionToolbar();
  }

  connectedCallback() {
    super.connectedCallback();
    //this.setAttribute("contenteditable", "true");
    this.addEventListener("input", (_: Event) => { this.normalizeChildren() });
    this.addEventListener('selectstart', (_: Event) => { 
      this.selection = true;
      // get the document
      console.log('focus ' + this.tagName);
    });
    document.addEventListener('selectionchange', this.documentSelectionChange.bind(this));
  }

  documentSelectionChange(_: Event) {
    if(document.getSelection()?.rangeCount == 1 && !document.getSelection()?.getRangeAt(0).collapsed && document.getSelection()?.anchorNode != null && this.contains((document.getSelection()?.anchorNode as Node))) {
      this.selection = true;
      this.showSelectionToolbar();
    } else {
      this.hideSelectionToolbar();
      this.selection = false;
    }
  }

  selectionToolBar: SelectionActions | null = null;

  setupSelectionToolbar() {
    if((this.shadowRoot!.querySelector('markdown-selection-actions') as SelectionActions) != null) {
      this.selectionToolBar = (this.shadowRoot!.querySelector('markdown-selection-actions') as SelectionActions);
    }
    if(this.selectionToolBar != null) {
      this.hideSelectionToolbar();
      this.selectionToolBar.applyTo = this;
    }
  }
  showSelectionToolBarTimeout: any = null;
  showSelectionToolbar() {
    if(this.selectionToolBar != null) {
      if(this.showSelectionToolBarTimeout != null) {
        clearTimeout(this.showSelectionToolBarTimeout);
      }
      this.showSelectionToolBarTimeout = setTimeout(() => {
        this.showSelectionToolBarTimeout = null;
        if(this.selection) {
          this.selectionToolBar!.style.display = 'block';
          this.selectionToolBar!.style.top = document.getSelection()?.getRangeAt(0).getBoundingClientRect().bottom + 'px';
          this.selectionToolBar!.style.left = document.getSelection()?.getRangeAt(0).getBoundingClientRect().right + 'px';
        }
      }, 350);
    }
  }
  hideSelectionToolbar() {
    if(this.selectionToolBar != null) {
      this.selectionToolBar!.style!.display = 'none';
    }
  }

  disconnectedCallback() {
    document.removeEventListener('selectionchange', this.documentSelectionChange);
  }

}




/**
 */
@customElement('markdown-paragraph')
export class Paragraph extends LeafElement {
  static styles = css`
    :host {
      position: relative;
    }
  `;

  render() {
    return html`
      <p >
        <slot></slot>
      </p>
      <markdown-selection-actions></markdown-selection-actions>
    `;
  }
  getMarkdown(): string {
    return Array.from(this.childNodes).map((child) => {
      if(child instanceof MarkdownElement) {
        return child.getMarkdown();
      } else {
        if(child.textContent?.replace(/\s/g, '').length == 0) {
          return "";
        } else {
          return child.textContent?.replace(/^\s+/gm, ' ');
        }
      }
    }).join('') + '\n\n';
  }
}


/**
 * selection actions
 */

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
    let element = document.createElement('markdown-title-1');
    Array.from(this.applyTo!.childNodes).forEach((child) => { element.append(child) });
    this.applyTo?.replaceWith(element);
  }
}

/**
 * toolbar --------------------------------------------------------
 */
@customElement('markdown-toolbar')
export class Toolbar extends LitElement {

  applyTo: Document | null = null;


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
    var parent = this.parentNode
    while(parent != null && parent != document && !(parent instanceof Document)) { parent = parent?.parentNode }
    if(parent instanceof Document) {
      this.applyTo = parent;
    }
  }

  _title1Element() {
    let element = document.createElement('markdown-title-1');
    let oldElement = this.applyTo!.getCurrentLeafBlock();
    if(oldElement != null) {
      Array.from(oldElement.childNodes).forEach((child) => { element.append(child) });
      oldElement.replaceWith(element);
    }
  }
}


/**
 * Thematic break --------------------------------------------------------
 */
@customElement('markdown-break')
export class ThematicBreak extends LeafElement {
  render() {
    return html`
      <hr />
    `;
  }
  getMarkdown(): string {
    return "-----------------------\n";
  }
}

/**
 * BlockQuote --------------------------------------------------------
 */
@customElement('markdown-quote')
export class BlockQuote extends ContainerElement {
  getMarkdown(): string {
    return Array.from(this.childNodes).map((child) => {
      // THIS IS WRONG? SHOULD BE EVERY LINE, not every child
      if(child instanceof MarkdownElement) {
        return '> ' + child.getMarkdown();
      } else {
        return '> ' + child.textContent;
      }
    }).join('');
  }
}



/**
 * Heading --------------------------------------------------------
 */
abstract class Heading extends LeafElement {
  abstract depth: number;

  /* Why this does not work?
  render() {
    const template = `
      <h${this.level}>
        <slot></slot>
      </h${this.level}>
      <markdown-selection-actions></markdown-selection-actions>
    `;
    html`${unsafeHTML(template)}`;
  }*/
  getMarkdown(): string {
    return '#'.repeat(this.depth) + ' ' + super.getMarkdown();
  }
}

@customElement('markdown-title-1')
export class Title1 extends Heading {
  depth = 1;
  static styles = css``;
  render() {
    return html`
    <h1>
      <slot></slot>
    </h1>
    <markdown-selection-actions></markdown-selection-actions>
  `;
  }
}
@customElement('markdown-title-2')
export class Title2 extends Heading {
  depth = 2;
  static styles = css``;
  render() {
    return html`
    <h2>
      <slot></slot>
    </h2>
    <markdown-selection-actions></markdown-selection-actions>
  `;
  }
}
@customElement('markdown-title-3')
export class Title3 extends Heading {
  depth = 3;
  static styles = css``;
  render() {
    return html`
    <h3>
      <slot></slot>
    </h3>
    <markdown-selection-actions></markdown-selection-actions>
  `;
  }
}
@customElement('markdown-title-4')
export class Title4 extends Heading {
  depth = 4;
  static styles = css``;
  render() {
    return html`
    <h4>
      <slot></slot>
    </h4>
    <markdown-selection-actions></markdown-selection-actions>
  `;
  }
}
@customElement('markdown-title-5')
export class Title5 extends Heading {
  depth = 5;
  static styles = css``;
  render() {
    return html`
    <h5>
      <slot></slot>
    </h5>
    <markdown-selection-actions></markdown-selection-actions>
  `;
  }
}
@customElement('markdown-title-6')
export class Title6 extends Heading {
  depth = 6;
  static styles = css``;
  render() {
    return html`
    <h6>
      <slot></slot>
    </h6>
    <markdown-selection-actions></markdown-selection-actions>
  `;
  }
}


/**
 * code block --------------------------------------------------------
 */
@customElement('markdown-code')
export class CodeBlock extends LeafElement {
  // TODO info string as property/attribute
  static styles = css``;
  render() {
    return html`
    <pre><code><slot></slot></code></pre>
    <markdown-selection-actions></markdown-selection-actions>
  `;
  }
  getMarkdown(): string {
    return '```' + /*info + */ '\n' + super.getMarkdown() + '\n```';
  }
}



/**
 * code span --------------------------------------------------------
 */
@customElement('markdown-code-span')
export class CodeSpan extends InlineElement {
  // TODO info string as property/attribute
  static styles = css`
    :host {
      display: inline;
      font-family: monospace;
    }
  `;
  render() {
    return html`
      <slot></slot>
    <!--code>
      <slot></slot>
    </code-->
    <!--markdown-selection-actions></markdown-selection-actions-->
  `;
  }
  getMarkdown(): string {
    return '`' + super.getMarkdown() + '`';
  }
}


/**
 * List --------------------------------------------------------
 */
@customElement('markdown-list')
export class List extends ContainerElement {
  @property()
  ordered?: boolean // change to different  widget???
  @property()
  start?: number
  @property()
  spread?: boolean

  static styles = css`
    :host {
      counter-reset: section;
    }
  `;
  render() {
    return html`
      <slot></slot>
    <!--markdown-selection-actions></markdown-selection-actions-->
  `;
  }
}

@customElement('markdown-list-item')
export class ListItem extends ContainerElement {
  @property()
  spread?: boolean

  static styles = css`
    :host {
      position: relative;
    }
    :host::before {
      counter-increment: section;
      /*content: "X";*/
      content: counter(section) ".";
      position: absolute;
    }
    .item-container {
      padding-left: 20px;
    }
  `;
  render() {
    return html`
      <div class='item-container'><slot></slot></div>
    <!--markdown-selection-actions></markdown-selection-actions-->
  `;
  }

  getDepth(): number {
    var depth = 0;
    var ancestor = this.parentNode;
    while(ancestor != null && !(ancestor instanceof Document)) {
      if(ancestor instanceof List) {
        depth++;
      }
      ancestor = ancestor.parentNode;
    }
    return depth;
  }

  getMarkdown(): string {
    return '  '.repeat(this.getDepth()) + '- ' + this.getTaskMarkdown() + super.getMarkdown(); // + '\n';
  }
  getTaskMarkdown(): string { return '' }
}

@customElement('markdown-task-list-item')
export class TaskListItem extends ListItem {
  @property({ type: Boolean, converter: { 
      fromAttribute: (value: any, _type: any) => { return value == 'true' },
      toAttribute: (value: Boolean, _type: any) => { return value != null ? value?.valueOf() : false }
    }
   })
  checked: Boolean = false

  // TODO reuse inherit from list item
  static styles = css`
    :host {
      position: relative;
    }
    :host::before {
      counter-increment: section;
      /*content: "X";*/
      content: counter(section) ".";
      position: absolute;
    }
    .item-container {
      padding-left: 35px;
    }
    input {
      position: absolute;
      z-index: 3;
      left: 15px;
    }
  `;
  render() {
    return html`
      <input type='checkbox' @change=${this._selection}/>
      <div class='item-container'><slot></slot></div>
    <!--markdown-selection-actions></markdown-selection-actions-->
  `;
  }
  _selection(e: Event) {
    this.setAttribute('checked', (e.target as HTMLInputElement).checked + '');
  }
  firstUpdated(changedProperties: Map<string, string>) { 
    if(changedProperties.has('checked')) {
      (this.shadowRoot!.querySelector('input') as HTMLInputElement).checked = this.checked.valueOf();
    }
   }

  getTaskMarkdown(): string { return '[' + (this.checked ? 'x' : ' ') + '] ' }
}


/**
 * HTML --------------------------------------------------------
 */
@customElement('markdown-html')
export class HTML extends LeafElement {
  static styles = css`
  `;
  render() {
    return html`
      <slot></slot>
  `;
  }
  getMarkdown(): string {
    return this.innerHTML.trimLeft().trimRight();
  }
}

/**
 * Table --------------------------------------------------------
 * TODO add buttons to add/remove rows/columns
 */
enum alignType {
  left= "left",
  right = "right",
  center = "center"
}
@customElement('markdown-table')
export class Table extends ContainerElement {

  static styles = css`
    :host {
      display: table;
      border-collapse: collapse;
      /*border: lightgrey 1px solid;*/
    }
  `;
  render() {
    return html`
      <slot></slot>
    <!--markdown-selection-actions></markdown-selection-actions-->
  `;
  }
  getMarkdown(): string {
    return '\n' + Array.from(this.children).map((child) => {
      if(child instanceof TableRow) {
        return child.getMarkdown();
      } else {
        return "";
      }
    }).join('\n') + '\n';
  }
}


@customElement('markdown-table-row')
export class TableRow extends ContainerElement {

  static styles = css`
    :host {
      display: table-row;
      border: lightgrey 1px solid;
    }
  `;
  render() {
    return html`
      <slot></slot>
    <!--markdown-selection-actions></markdown-selection-actions-->
  `;
  }
  public getMarkdown(): string {
    // TODO prettier output! use longest size etc.
    return '| ' + Array.from(this.children).map((child) => {
      if(child instanceof MarkdownElement) {
        return child.getMarkdown();
      } else {
        return "";
      }
    }).join(' | ') + ' |';
  }
}

@customElement('markdown-table-header-row')
export class TableHeaderRow extends TableRow {

  static styles = css`
    :host {
      display: table-row;
      border: lightgrey 1px solid;
    }
  `;
  public getMarkdown(): string {
    // TODO prettier output! use longest size etc.
    // TODO aligns
    return super.getMarkdown() + '\n' +
      '| ' + '--- |'.repeat(this.children.length);
  }
}

@customElement('markdown-table-cell')
export class TableCell extends ContainerElement {

  static styles = css`
    :host {
      display: table-cell;
      border: lightgrey 1px solid;
    }
  `;
  render() {
    return html`
      <slot></slot>
    <!--markdown-selection-actions></markdown-selection-actions-->
  `;
  }

  getMarkdown(): string {
    return Array.from(this.childNodes).map((child) => {
      if(child instanceof MarkdownElement) {
        return child.getMarkdown();
      } else {
        if(child.textContent?.replace(/\s/g, '').length == 0) {
          return "";
        } else {
          return child.textContent?.replace(/^\s+/gm, ' ');
        }
      }
    }).join('');
  }
}

@customElement('markdown-table-header-cell')
export class TableHeaderCell extends TableCell {
  @property()
  align?: alignType

  static styles = css`
    :host {
      display: table-cell;
      border: lightgrey 1px solid;
      background-color: lightgray;
    }
  `;
}

/**
 * link --------------------------------------------------------
 */
@customElement('markdown-link')
export class Link extends InlineElement {
  @property()
  destination: string = '';
  @property()
  title: string = ''; // TODO make it optional

  static styles = css`
  `;
  render() {
    return html`
      <a href="${this.destination}" title="${this.title}"><slot></slot></a>
  `;
  }
  getMarkdown(): string {
    return `[${this.innerText}](${this.destination} "${this.title}")`;
  }
}

/**
 * image --------------------------------------------------------
 */
@customElement('markdown-image')
export class Image extends InlineElement {
  @property()
  destination: string = '';
  @property()
  title: string = ''; // TODO make it optional

  static styles = css`
  `;
  render() {
    // TODO the alt innertext is not working
    return html`
      <img src="${this.destination}" title="${this.title}" alt="${this.innerText}"/>
      <slot style='display:none;'></slot>
  `;
  }
  getMarkdown(): string {
    return `![${this.innerText}](${this.destination} "${this.title}")`;
  }
}


declare global {
  interface HTMLElementTagNameMap {
    'markdown-document': Document;
    'markdown-paragraph': Paragraph;
  }
}



