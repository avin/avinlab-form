import type { ComponentType } from 'react';
import { Highlight, themes } from 'prism-react-renderer';

export interface Example {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  api: string[];
  Component: ComponentType;
  source: string;
}

export function ExampleCard({ example, number }: { example: Example; number: number }) {
  const { Component, api, id, source, summary, tags, title } = example;

  return (
    <article className="example-card" id={id}>
      <header className="example-header">
        <span className="example-number">{String(number).padStart(2, '0')}</span>
        <div>
          <div className="example-title-row">
            <h3>{title}</h3>
            <div className="tag-list" aria-label="Example tags">
              {tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
          <p>{summary}</p>
        </div>
      </header>

      <div className="api-list" aria-label="APIs used">
        {api.map((item) => (
          <code key={item}>{item}</code>
        ))}
      </div>

      <div className="demo-surface">
        <Component />
      </div>

      <details className="source-code">
        <summary>View the complete example</summary>
        <Highlight code={source.trim()} language="tsx" theme={themes.nightOwl}>
          {({ className, getLineProps, getTokenProps, style, tokens }) => (
            <pre className={className} style={style} tabIndex={0}>
              {tokens.map((line, lineIndex) => (
                <div {...getLineProps({ line })} key={lineIndex}>
                  <span className="line-number">{lineIndex + 1}</span>
                  {line.map((token, tokenIndex) => (
                    <span {...getTokenProps({ token })} key={tokenIndex} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </details>
    </article>
  );
}
