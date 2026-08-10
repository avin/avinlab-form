import { ExampleCard } from './components/ExampleCard';
import { sections } from './examples';

const exampleCount = sections.reduce((count, section) => count + section.examples.length, 0);

export function App() {
  let exampleNumber = 0;

  return (
    <>
      <header className="site-header" id="top">
        <nav className="topbar" aria-label="Main navigation">
          <span className="wordmark">@avinlab/form</span>
          <a className="repo-link" href="https://github.com/avin/avinlab-form">
            GitHub ↗
          </a>
        </nav>
      </header>

      <div className="page-shell">
        <aside className="section-nav" aria-label="Example sections">
          <p>On this page</p>
          {sections.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              {section.title}
              <span>{section.examples.length}</span>
            </a>
          ))}
        </aside>

        <main>
          {sections.map((section) => (
            <section className="example-section" id={section.id} key={section.id}>
              <header className="section-header">
                <p className="eyebrow">{section.eyebrow}</p>
                <h2>{section.title}</h2>
                <p>{section.description}</p>
              </header>

              <div className="example-grid">
                {section.examples.map((example) => {
                  exampleNumber += 1;
                  return <ExampleCard example={example} number={exampleNumber} key={example.id} />;
                })}
              </div>
            </section>
          ))}
        </main>
      </div>

      <footer>
        <p>
          {exampleCount} examples use the package source through Vite aliases, so they exercise the
          current API.
        </p>
        <a href="#top">Back to top ↑</a>
      </footer>
    </>
  );
}
