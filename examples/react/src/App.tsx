import { useState } from 'react';
import { ExampleCard } from './components/ExampleCard';
import { examples, exampleTags } from './examples';

type ExampleTag = (typeof exampleTags)[number];

export function App() {
  const [selectedTags, setSelectedTags] = useState<ExampleTag[]>([]);
  const visibleExamples = examples
    .map((example, index) => ({ example, number: index + 1 }))
    .filter(({ example }) => selectedTags.every((tag) => example.tags.includes(tag)));

  const toggleTag = (tag: ExampleTag) => {
    setSelectedTags((currentTags) =>
      currentTags.includes(tag)
        ? currentTags.filter((currentTag) => currentTag !== tag)
        : [...currentTags, tag],
    );
  };

  return (
    <>
      <header className="site-header" id="top">
        <nav className="topbar" aria-label="Main navigation">
          <span className="wordmark">@avinlab/form examples</span>
          <a className="repo-link" href="https://github.com/avin/avinlab-form">
            GitHub ↗
          </a>
        </nav>
      </header>

      <main className="page-shell">
        <section className="filters" aria-labelledby="filter-title">
          <div className="filter-heading">
            <div>
              <h2 id="filter-title">Filter by tags</h2>
              <p>Select several tags to show examples that have all of them.</p>
            </div>
            <output>
              {visibleExamples.length} of {examples.length}
            </output>
          </div>

          <div className="filter-list">
            {exampleTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              const count = examples.filter((example) => example.tags.includes(tag)).length;

              return (
                <button
                  aria-pressed={isSelected}
                  className={isSelected ? 'is-selected' : undefined}
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  type="button"
                >
                  {tag} <span>{count}</span>
                </button>
              );
            })}
            {selectedTags.length > 0 && (
              <button className="clear-filters" onClick={() => setSelectedTags([])} type="button">
                Clear
              </button>
            )}
          </div>
        </section>

        <div className="example-grid">
          {visibleExamples.map(({ example, number }) => (
            <ExampleCard example={example} number={number} key={example.id} />
          ))}
        </div>
      </main>

      <footer>
        <a href="#top">Back to top ↑</a>
      </footer>
    </>
  );
}
