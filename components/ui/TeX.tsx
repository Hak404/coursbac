import katex from "katex";

type Props = {
  children: string;
  block?: boolean;
  className?: string;
};

export function renderLatex(latex: string, block: boolean): string {
  return katex.renderToString(latex, {
    displayMode: block,
    throwOnError: false,
    strict: false,
    trust: false,
  });
}

export function TeX({ children, className }: Props) {
  const html = renderLatex(children, false);
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function Formula({ children, className }: Props) {
  const html = renderLatex(children, true);
  return (
    <span
      className={`math-block block ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function InlineMath({ children }: { children: string }) {
  return <TeX>{children}</TeX>;
}