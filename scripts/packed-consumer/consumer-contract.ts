import { createForm } from '@avinlab/form';
import { useFormWatch } from '@avinlab/react-form';

const form = createForm({ name: 'Ada' });
const watchedName: string = useFormWatch(form, 'name');
void watchedName;
