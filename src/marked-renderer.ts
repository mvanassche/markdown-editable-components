import { Align, Marked, Renderer } from '@ts-stack/markdown';
 
class MyRenderer extends Renderer
{

  code(code: string, lang?: string, _escaped?: boolean): string {
    // TODO escaped?
    return `<markdown-code info='${lang}'>${code}</markdown-code>`;
  }
  blockquote(quote: string): string {
    return `<markdown-quote>${quote}</markdown-quote>`;
  }
  html(html: string): string {
    return `<markdown-html>${html}</markdown-html>`;
  }
  heading(text: string, level: number, _raw: string)
  {
      return `<markdown-title-${level}>${text}</markdown-title-${level}>`;
  }
  list(body: string, ordered?: boolean): string {
    return `<markdown-list ordered='${ordered}'>${body}</markdown-list>`;
  }
  listitem(text: string): string {
    if(text.startsWith("<markdown-paragraph>[ ] ")) {
      // see https://github.com/ts-stack/markdown/issues/8
      return `<markdown-task-list-item>${text.replace("<markdown-paragraph>[ ] ", "<markdown-paragraph>")}</markdown-task-list-item>`;
    } else if(text.startsWith("<markdown-paragraph>[x] ")) {
      return `<markdown-task-list-item checked='true'>${text.replace("<markdown-paragraph>[x] ", "<markdown-paragraph>")}</markdown-task-list-item>`;
    } else {
      return `<markdown-list-item>${text}</markdown-list-item>`;
    }
  }
  paragraph(text: string): string {
    return `<markdown-paragraph>${text}</markdown-paragraph>`;
  }
  codespan(text: string): string {
    return `<markdown-code-span>${text}</markdown-code-span>`;
  }
  hr(): string {
    return `<markdown-break></markdown-break>`;
  }
  table(header: string, body: string): string {
    return `<markdown-table>${header.replaceAll('markdown-table-row>', 'markdown-table-header-row>')}${body}</markdown-table>`;
  }
  tablerow(content: string): string {
    return `<markdown-table-row>${content}</markdown-table-row>`;
  }
  tablecell(content: string, flags: {
      header?: boolean;
      align?: Align;
  }): string {
    if(flags.header == true) {
      return `<markdown-table-header-cell>${content}</markdown-table-header-cell>`;
    } else {
      return `<markdown-table-cell>${content}</markdown-table-cell>`;
    }
  }
  link(href: string, title: string, text: string): string {
    return `<markdown-link destination='${href}' title='${title}'>${text}</markdown-link>`;
  }
  image(href: string, title: string, text: string): string {
    return `<markdown-image destination='${href}' title='${title}'>${text}</markdown-image>`;
  }
  /*
  strong(text: string): string;
  em(text: string): string;
  br(): string;
  del(text: string): string;
  text(text: string): string;*/

}
 
Marked.setOptions({renderer: new MyRenderer});
 

export var md = Marked;
