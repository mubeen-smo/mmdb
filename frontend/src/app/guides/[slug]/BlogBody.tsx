"use client";

import ReactMarkdown from "react-markdown";

export function BlogBody({ content }: { content: string }) {
  return (
    <div className="
      [&_h1]:type-display-sm [&_h1]:text-on-surface [&_h1]:mb-6 [&_h1]:mt-10
      [&_h2]:type-headline-lg [&_h2]:text-on-surface [&_h2]:mb-4 [&_h2]:mt-8
      [&_h3]:type-headline-md [&_h3]:text-on-surface [&_h3]:mb-3 [&_h3]:mt-6
      [&_p]:type-body-lg [&_p]:text-secondary [&_p]:mb-5 [&_p]:leading-relaxed
      [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ul]:text-secondary [&_ul]:type-body-lg
      [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5 [&_ol]:text-secondary [&_ol]:type-body-lg
      [&_li]:mb-2
      [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-6 [&_blockquote]:py-1
        [&_blockquote]:my-6 [&_blockquote]:text-secondary [&_blockquote]:italic [&_blockquote]:type-body-lg
      [&_code]:bg-surface-container-high [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded
        [&_code]:text-sm [&_code]:font-mono [&_code]:text-on-surface
      [&_pre]:bg-surface-container-high [&_pre]:rounded-xl [&_pre]:p-6 [&_pre]:mb-6 [&_pre]:overflow-x-auto
      [&_pre_code]:bg-transparent [&_pre_code]:p-0
      [&_hr]:border-outline/20 [&_hr]:my-8
      [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-primary/80
      [&_strong]:text-on-surface [&_strong]:font-semibold
    ">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
