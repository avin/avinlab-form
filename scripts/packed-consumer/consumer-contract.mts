import { createForm } from '@avinlab/form';
import { useFormWatch } from '@avinlab/react-form';

const form = createForm({ name: 'Ada' });
const watchedName: string = useFormWatch(form, 'name');
// @ts-expect-error Published snapshots are readonly.
form.values.name = 'Grace';
// @ts-expect-error Undeclared deep imports are unavailable to consumers.
await import('@avinlab/form/dist/index.js');
void watchedName;
