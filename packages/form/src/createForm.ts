export type UpdateHandler = (values: Record<string, any>, prevValues: Record<string, any>) => void;
type UpdateFieldHandler = (newValue: any, oldValue: any) => void;

export interface Form {
  values: Record<string, any>;
  prevValues: Record<string, any>;
  setValue: (fieldName: string, value: any) => void;
  onUpdateField: (fieldName: string, cb: UpdateFieldHandler) => void;
  offUpdateField: (fieldName: string, cb: UpdateFieldHandler) => void;
  onUpdate: (cb: UpdateHandler) => void;
  offUpdate: (cb: UpdateHandler) => void;
}

export const createForm = (initialValues: Record<string, any>): Form => {
  let values = { ...initialValues };
  let prevValues: Record<string, any> = {};
  let _onUpdateHandlers: UpdateHandler[] = [];
  let _onUpdateFieldHandlers: Record<string, UpdateFieldHandler[]> = {};

  const setValue = (fieldName: string, value: any) => {
    const prevValue = values[fieldName];

    if (value !== prevValue) {
      prevValues = { ...values };
      values = {
        ...values,
        [fieldName]: value,
      };

      (_onUpdateFieldHandlers[fieldName] || []).forEach((cb) => {
        cb(value, prevValue);
      });

      _onUpdateHandlers.forEach((cb) => {
        cb(values, prevValues);
      });
    }
  };

  const onUpdateField = (fieldName: string, cb: UpdateFieldHandler) => {
    _onUpdateFieldHandlers[fieldName] = _onUpdateFieldHandlers[fieldName] || [];
    _onUpdateFieldHandlers[fieldName].push(cb);
  };

  const offUpdateField = (fieldName: string, cb: UpdateFieldHandler) => {
    _onUpdateFieldHandlers[fieldName] = _onUpdateFieldHandlers[fieldName] || [];
    _onUpdateFieldHandlers[fieldName] = _onUpdateFieldHandlers[fieldName].filter(
      (handler) => handler !== cb,
    );
  };

  const onUpdate = (cb: UpdateHandler) => {
    _onUpdateHandlers.push(cb);
  };

  const offUpdate = (cb: UpdateHandler) => {
    _onUpdateHandlers = _onUpdateHandlers.filter((handler) => handler !== cb);
  };

  return {
    get values() {
      return values;
    },
    get prevValues() {
      return prevValues;
    },
    setValue,
    onUpdateField,
    offUpdateField,
    onUpdate,
    offUpdate,
  };
};
