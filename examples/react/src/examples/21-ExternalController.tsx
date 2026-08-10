import { createForm } from '@avinlab/form';
import { useFormWatch } from '@avinlab/react-form';

const sharedCounter = createForm({ count: 0 });

export function ExternalController() {
  const count = useFormWatch(sharedCounter, 'count');

  return (
    <div className="demo-stack">
      <button
        type="button"
        onClick={() => sharedCounter.setValue('count', sharedCounter.values.count + 1)}
      >
        Increment shared controller
      </button>
      <output>{count}</output>
    </div>
  );
}
