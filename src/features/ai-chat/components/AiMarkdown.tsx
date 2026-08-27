import ReactMarkdown, { type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";

const REMARK_PLUGINS = [remarkBreaks];

const COMPONENTS: Components = {
  p: ({ children }) => (
    <p className="whitespace-pre-wrap break-words [&:not(:first-child)]:mt-2">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="my-2 list-disc space-y-1 pl-4 marker:text-neutral-400">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 list-decimal space-y-1 pl-4 marker:text-neutral-400">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="break-words pl-0.5 leading-relaxed">{children}</li>
  ),
  a: ({ children, href }) => (
    <a
      className="text-brand-600 underline decoration-brand-300 underline-offset-2 hover:text-brand-700"
      href={href}
      rel="noopener noreferrer"
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
  pre: ({ children }) => (
    <pre className="scrollbar-thin my-2 overflow-x-auto rounded-8 bg-neutral-900/[0.06] p-2.5 font-mono text-[12.5px] leading-normal">
      {children}
    </pre>
  ),
  // h1-h6 all collapse to the same weight as bold body text — a stray "#"
  // in model output (never instructed, but not impossible) shouldn't be
  // able to render larger than the bubble's own header text.
  h1: ({ children }) => (
    <p className="mt-2 font-semibold first:mt-0">{children}</p>
  ),
  h2: ({ children }) => (
    <p className="mt-2 font-semibold first:mt-0">{children}</p>
  ),
  h3: ({ children }) => (
    <p className="mt-2 font-semibold first:mt-0">{children}</p>
  ),
  h4: ({ children }) => (
    <p className="mt-2 font-semibold first:mt-0">{children}</p>
  ),
  h5: ({ children }) => (
    <p className="mt-2 font-semibold first:mt-0">{children}</p>
  ),
  h6: ({ children }) => (
    <p className="mt-2 font-semibold first:mt-0">{children}</p>
  ),
  img: () => null,
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-neutral-200 pl-3 text-neutral-600">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-2.5 border-neutral-200" />,
};

export const AiMarkdown = ({ text }: { text: string }) => (
  <ReactMarkdown components={COMPONENTS} remarkPlugins={REMARK_PLUGINS}>
    {text}
  </ReactMarkdown>
);
