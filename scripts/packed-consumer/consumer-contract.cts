import formPackage = require('@avinlab/form');
import reactFormPackage = require('@avinlab/react-form');

const form = formPackage.createForm({ name: 'Ada' });
const watchedName: string = reactFormPackage.useFormWatch(form, 'name');
void watchedName;
