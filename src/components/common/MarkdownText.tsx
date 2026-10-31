import type { ReactNode } from 'react';

type Block = { type: 'paragraph'; text: string } | { type: 'list'; items: string[] };

function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  for (const rawLine of source.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    const bullet = line.match(/^[-*]\s+(.*)$/);
    const last = blocks[blocks.length - 1];
    if (bullet) {
      if (last?.type === 'list') last.items.push(bullet[1]);
      else blocks.push({ type: 'list', items: [bullet[1]] });
    } else if (last?.type === 'paragraph') {
      last.text = `${last.text} ${line}`;
    } else {
      blocks.push({ type: 'paragraph', text: line });
    }
  }
  return blocks;
}

function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4 ? (
      <strong key={index} className="font-semibold text-foreground">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}

export function MarkdownText({ text }: { text: string }) {
  return (
    <div className="space-y-3 text-sm leading-[1.5] text-foreground/90">
      {parseBlocks(text).map((block, index) =>
        block.type === 'list' ? (
          <ul key={index} className="space-y-1.5">
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex} className="flex gap-2.5">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-lime" aria-hidden="true" />
                <span>{renderInline(item)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p key={index}>{renderInline(block.text)}</p>
        )
      )}
    </div>
  );
}
