import { memo } from 'react';

interface MarkdownRendererProps { content: string; className?: string; }

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function renderInline(text: string): string {
  let result = escapeHtml(text);
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong class="text-cream font-semibold">$1</strong>');
  result = result.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
  return result;
}

function renderMarkdown(content: string): string {
  const lines = content.split('\n');
  const html: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { html.push('<div class="h-3"></div>'); continue; }
    if (trimmed.startsWith('### ')) { html.push(`<h4 class="font-cinzel text-base text-gold-light mt-3 mb-1">${escapeHtml(trimmed.slice(4))}</h4>`); continue; }
    if (trimmed.startsWith('## ')) { html.push(`<h3 class="font-cinzel text-lg text-gold-light mt-4 mb-2">${escapeHtml(trimmed.slice(3))}</h3>`); continue; }
    if (trimmed.startsWith('# ')) { html.push(`<h2 class="font-cinzel text-xl text-cream mt-4 mb-2">${escapeHtml(trimmed.slice(2))}</h2>`); continue; }
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      html.push(`<p class="font-cormorant text-base text-cream/70 leading-relaxed pl-4">• ${renderInline(trimmed.slice(2))}</p>`);
      continue;
    }
    html.push(`<p class="font-cormorant text-base text-cream/70 leading-relaxed">${renderInline(trimmed)}</p>`);
  }
  return html.join('');
}

export const MarkdownRenderer = memo(function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />;
});
