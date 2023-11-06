import { useEffect, useState } from 'react';
import cn from 'clsx';
import { CardForm } from './components/forms/CardForm.tsx';
import { DebugForm } from './components/forms/DebugForm.tsx';
import { getQueryParamByName, setQueryParam } from './utils/queryParam.ts';

const forms = [
  {
    label: 'Card Form',
    key: 'card',
  },
  {
    label: 'Debug Form',
    key: 'debug',
  },
];

export function App() {
  const [currentForm, setCurrentForm] = useState(getQueryParamByName('form') || 'card');

  const FormComponent = {
    card: CardForm,
    debug: DebugForm,
  }[currentForm]!;

  useEffect(() => {
    setQueryParam('form', currentForm);
  }, [currentForm]);

  return (
    <div>
      <div className="border-b border-b-gray-400 mb-4 p-4">
        <ul className="flex space-x-4">
          {forms.map(({ key, label }) => {
            return (
              <li key={key}>
                <button
                  className={cn('border rounded border-gray-300 px-4 py-2', {
                    'bg-gray-300': key === currentForm,
                  })}
                  onClick={() => setCurrentForm(key)}
                >
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <FormComponent />
    </div>
  );
}
