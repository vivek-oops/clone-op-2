const HTML_TAG_RE = /<[a-z][\s\S]*>/i;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&[a-z]+;/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatLink = (text: string, url: string) => {
  const safeText = escapeHtml(text);
  const safeUrl = escapeHtml(url.trim());
  const isInternal =
    safeUrl.startsWith('#') ||
    safeUrl.startsWith('/') ||
    safeUrl.startsWith('https://oopsipleasured.in');
  const targetAttrs = isInternal ? '' : ' target="_blank" rel="noopener noreferrer"';
  return `<a href="${safeUrl}"${targetAttrs}>${safeText}</a>`;
};

const formatInlineMarkdown = (text: string) => {
  let formatted = escapeHtml(text);

  formatted = formatted.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]+|#[^\)\s]+)\)/g, (_, label, url) =>
    formatLink(label, url)
  );
  formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  formatted = formatted.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  formatted = formatted.replace(/_([^_\n]+)_/g, '<em>$1</em>');
  formatted = formatted.replace(
    /(^|[\s(])((https?:\/\/[^\s<]+))/g,
    (_, prefix, url) => `${prefix}${formatLink(url, url)}`
  );

  return formatted;
};

const flushParagraph = (buffer: string[], html: string[]) => {
  if (buffer.length === 0) return;
  html.push(`<p>${buffer.map(formatInlineMarkdown).join('<br />')}</p>`);
  buffer.length = 0;
};

const flushList = (items: string[], type: 'ul' | 'ol' | null, html: string[]) => {
  if (!type || items.length === 0) return;
  html.push(`<${type}>${items.map((item) => `<li>${formatInlineMarkdown(item)}</li>`).join('')}</${type}>`);
  items.length = 0;
};

export const renderBlogContent = (content: string | null | undefined) => {
  if (!content?.trim()) return '';
  if (HTML_TAG_RE.test(content)) return content;

  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  const paragraphBuffer: string[] = [];
  const listItems: string[] = [];
  const headingCounts = new Map<string, number>();
  let listType: 'ul' | 'ol' | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph(paragraphBuffer, html);
      flushList(listItems, listType, html);
      listType = null;
      continue;
    }

    if (/^---+$/.test(line)) {
      flushParagraph(paragraphBuffer, html);
      flushList(listItems, listType, html);
      listType = null;
      html.push('<hr />');
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph(paragraphBuffer, html);
      flushList(listItems, listType, html);
      listType = null;
      const level = headingMatch[1].length;
      const headingText = headingMatch[2].trim();
      const baseId = slugify(headingText);
      const seenCount = headingCounts.get(baseId) ?? 0;
      const headingId = seenCount === 0 ? baseId : `${baseId}-${seenCount + 1}`;
      headingCounts.set(baseId, seenCount + 1);
      html.push(`<h${level} id="${headingId}">${formatInlineMarkdown(headingText)}</h${level}>`);
      continue;
    }

    const unorderedMatch = line.match(/^[-*+]\s+(.+)$/);
    if (unorderedMatch) {
      flushParagraph(paragraphBuffer, html);
      if (listType && listType !== 'ul') {
        flushList(listItems, listType, html);
      }
      listType = 'ul';
      listItems.push(unorderedMatch[1]);
      continue;
    }

    const orderedMatch = line.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      flushParagraph(paragraphBuffer, html);
      if (listType && listType !== 'ol') {
        flushList(listItems, listType, html);
      }
      listType = 'ol';
      listItems.push(orderedMatch[1]);
      continue;
    }

    flushList(listItems, listType, html);
    listType = null;
    paragraphBuffer.push(line);
  }

  flushParagraph(paragraphBuffer, html);
  flushList(listItems, listType, html);

  return html.join('\n');
};
