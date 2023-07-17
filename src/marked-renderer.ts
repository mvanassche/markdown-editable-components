/*
  https://www.markdownguide.org/extended-syntax/#heading-ids
  https://github.com/syntax-tree/mdast#code
  https://stackoverflow.com/questions/5319754/cross-reference-named-anchor-in-markdown
  https://github.com/ts-stack/markdown#overriding-renderer-methods
*/

import { Align, Marked, Renderer, MarkedOptions } from '@ts-stack/markdown';
 
export class MarkdownEditableComponentsRenderer extends Renderer {

  toc(): string {
    return `<markdown-toc></markdown-toc>`
  }

  override code(code: string, lang?: string, escaped?: boolean, meta?: string): string {
    // TODO escaped?
    if (!escaped && this.options.escape) {
      code = this.options.escape?.call(this, code);
      escaped = true;
    }

    if (meta) {
      let id: string;
      [id, lang] = this.parseAnchor("code-", meta, false);

      return this.codeWithAnchor(code, lang, id, escaped);
    } else {
      return this.codeWithAnchor(code, lang, undefined, escaped);
    }
  }

  codeWithAnchor(code: string, lang?: string, id?: string, escaped?: boolean): string {
    const langAttr = lang ? `lang='${lang}'` : "";
    const idAttr = id ? `id='${id}'` : "";

    if (!escaped && this.options.escape) {
      code = this.options.escape?.call(this, code);
      escaped = true;
    }

    return `<markdown-code ${langAttr} ${idAttr}>${code}</markdown-code>`;
  }

  custom(tag: string, content: string): string {
    return `<${tag}>${content}</${tag}>`;
  }

  override blockquote(quote: string): string {
    return `<markdown-quote>${quote}</markdown-quote>`;
  }

  override html(html: string): string {
    return `<markdown-html>${html}</markdown-html>`;
  }

  override heading(text: string, level: number, raw: string) {
    let id: string;
    [id, text] = this.parseAnchor("heading-", text, true);

    return this.headingWithAnchor(text, level, raw, id);
  }

  headingWithAnchor(text: string, level: number, _raw: string, id?: string) {
    const idAttr = id ? `id='${id}'` : "";

    return `<markdown-header-${level} ${idAttr}>${text}</markdown-header-${level}>`;
  }

  override list(body: string, ordered?: boolean): string {
    return `<markdown-list ordered='${ordered}'>${body}</markdown-list>`;
  }

  override listitem(text: string): string {
    if (text.startsWith("<markdown-paragraph>[ ] ")) {
      // see https://github.com/ts-stack/markdown/issues/8
      return `<markdown-task-list-item>${text.replace("<markdown-paragraph>[ ] ", "<markdown-paragraph>")}</markdown-task-list-item>`;
    } else if (text.startsWith("<markdown-paragraph>[x] ")) {
      return `<markdown-task-list-item checked='true'>${text.replace("<markdown-paragraph>[x] ", "<markdown-paragraph>")}</markdown-task-list-item>`;
    } else if (text.startsWith("[ ] ")) {
      // see https://github.com/ts-stack/markdown/issues/8
      return `<markdown-task-list-item>${text.replace("[ ] ", "")}</markdown-task-list-item>`;
    } else if (text.startsWith("[x] ")) {
      return `<markdown-task-list-item checked='true'>${text.replace("[x] ", "")}</markdown-task-list-item>`;
    } else {
      return `<markdown-list-item>${text}</markdown-list-item>`;
    }
  }

  override paragraph(text: string): string {
    text = text.replaceAll("${toc}", this.toc());
    return `<markdown-paragraph>${text}</markdown-paragraph>`;
  }

  override codespan(text: string): string {
    return `<markdown-code-span>${text}</markdown-code-span>`;
  }

  override hr(): string {
    return `<markdown-break></markdown-break>`;
  }

  override strong(text: string): string {
    return `<markdown-strong>${text}</markdown-strong>`;
  }

  override em(text: string): string {
    return `<markdown-emphasis>${text}</markdown-emphasis>`;
  }

  override del(text: string): string {
    return `<markdown-strike>${text}</markdown-strike>`;
  }

  override table(header: string, body: string): string {
    return `<markdown-table>${header.replaceAll('markdown-table-row>', 'markdown-table-header-row>')}${body}</markdown-table>`;
  }

  override tablerow(content: string): string {
    return `<markdown-table-row>${content}</markdown-table-row>`;
  }

  override tablecell(
    content: string,
    flags: {
        header?: boolean;
        align?: Align; }): string {
    if (flags.header == true) {
      return `<markdown-table-header-cell>${content}</markdown-table-header-cell>`;
    } else {
      return `<markdown-table-cell>${content}</markdown-table-cell>`;
    }
  }

  override link(href: string, title: string, text: string): string {
    if(title) {
      return `<markdown-link destination='${href}' title='${title}'>${text}</markdown-link>`;
    } else {
      return `<markdown-link destination='${href}'>${text}</markdown-link>`;
    }
  }

  override image(href: string, title: string, text: string): string {
    if(title) {
      return `<markdown-image destination='${href}' title='${title}'>${text}</markdown-image>`;
    } else {
      return `<markdown-image destination='${href}'>${text}</markdown-image>`;
    }
  }

  // strong(text: string): string;
  // em(text: string): string;
  // br(): string;
  // del(text: string): string;
  // text(text: string): string;

  parseAnchor(idPrefixForDefault: string, text: string, useTextInId: boolean): [string, string] {
    const regexp = /\s*{([^}]+)}$/;
    const execArr = regexp.exec(text);

    let id;

    if (execArr) {
      text = text.replace(regexp, '');
      id = execArr[1];
    } else {
      if (useTextInId) {
        id = idPrefixForDefault + text.toLocaleLowerCase().replace(/[^\wа-яіїє]+/gi, '-');
      } else {
        id = idPrefixForDefault + (Date.now() + Math.random())
      }
    }

    return [id, text];
  }
}

export function parse(markdown: string, renderer?: MarkdownEditableComponentsRenderer): string {
  const options = new MarkedOptions();
  options.gfm = true;

  const actualRenderer = renderer != null ? renderer : new MarkdownEditableComponentsRenderer();
  options.renderer = actualRenderer;

  Marked.setBlockRule(
    // /^ *(`{3,}|~{3,})[ \.]*(\S+)? +{([^}]+)} *\n([\s\S]*?)\s*\1 *(?:\n+|$)/, 
    // TODO: check that works properly:
    /^ *(`{3,}|~{3,})[ .]*(\S+)? +{([^}]+)} *\n([\s\S]*?)\s*\1 *(?:\n+|$)/,
    function(this: MarkdownEditableComponentsRenderer, execArr) {
      return this.codeWithAnchor(execArr![4], execArr![2], execArr![3])
    }
  );

  Marked.setBlockRule(
    /^\[\[\[([a-z\-]+)\n([\s\S]+?)\1\]\]\]\n/,
    function(this: MarkdownEditableComponentsRenderer, execArr) {
      return this.custom(execArr![1], parse(execArr![2], renderer));
    }
  );

  return Marked.parse(markdown, options);
}
