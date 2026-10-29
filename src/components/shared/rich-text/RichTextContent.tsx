import type { ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";

// Renders the Markdown written with RichTextEditor. react-markdown never
// turns raw HTML in the source into DOM (it's shown as text), and its default
// urlTransform drops javascript:/data: link targets — so a stored
// "<script>" is inert. remark-breaks keeps single newlines as line breaks,
// which is how plain-text descriptions written before the editor existed
// still render the same.
const REMARK_PLUGINS = [remarkBreaks];

const heading = ({ children }: { children?: ReactNode }) => (
  <p className="mt-3 font-semibold text-neutral-800 first:mt-0">{children}</p>
);

const COMPONENTS: Components = {
  p: ({ children }) => (
    <p className="break-words [&:not(:first-child)]:mt-2">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-neutral-800">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="my-2 list-disc space-y-1 pl-5 marker:text-neutral-400">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 list-decimal space-y-1 pl-5 marker:text-neutral-400">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="break-words pl-0.5">{children}</li>,
  a: ({ children, href }) => (
    <a
      className="text-brand-600 underline decoration-brand-300 underline-offset-2 hover:text-brand-700"
      href={href}
      rel="noopener noreferrer nofollow"
      target="_blank"
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded-4 bg-neutral-900/[0.06] px-1 py-0.5 font-mono text-[13px]">
      {children}
    </code>
  ),
  h1: heading,
  h2: heading,
  h3: heading,
  h4: heading,
  h5: heading,
  h6: heading,
  img: () => null,
  hr: () => <hr className="my-3 border-neutral-200" />,
};

interface RichTextContentProps {
  text: string;
  className?: string;
}

export const RichTextContent = ({ text, className }: RichTextContentProps) => (
  <div className={className}>
    <ReactMarkdown components={COMPONENTS} remarkPlugins={REMARK_PLUGINS}>
      {text}
    </ReactMarkdown>
  </div>
);
