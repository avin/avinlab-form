import { objectsAreEqual } from './utils/objectsAreEqual';

export type FormValues = Record<string, any>;

type FieldUpdateHandlers<T> = {
  [K in keyof T]?: UpdateFieldHandler<T[K]>[];
};

export type UpdateHandler<TFormValues extends FormValues> = (
  values: TFormValues,
  prevValues: TFormValues,
) => void;
type UpdateFieldHandler<T> = (newValue: T, oldValue: T) => void;

export interface Form<TFormValues extends FormValues> {
  values: TFormValues;
  prevValues: TFormValues;
  setValue: <TFieldName extends keyof TFormValues>(
    fieldName: TFieldName,
    value: TFormValues[TFieldName],
  ) => void;
  setValues: (values: TFormValues) => void;
  onUpdateField: <TFieldName extends keyof TFormValues>(
    fieldName: TFieldName,
    cb: UpdateFieldHandler<TFormValues[TFieldName]>,
  ) => void;
  offUpdateField: <TFieldName extends keyof TFormValues>(
    fieldName: TFieldName,
    cb: UpdateFieldHandler<TFormValues[TFieldName]>,
  ) => void;
  onUpdate: (cb: UpdateHandler<TFormValues>) => void;
  offUpdate: (cb: UpdateHandler<TFormValues>) => void;
}

export const createForm = <TFormValues extends FormValues>(
  initialValues: TFormValues,
): Form<TFormValues> => {
  let values = { ...initialValues };
  let prevValues: TFormValues = { ...initialValues };
  let _onUpdateHandlers: UpdateHandler<TFormValues>[] = [];
  let _onUpdateFieldHandlers: FieldUpdateHandlers<TFormValues> = {};

  const setValue = <TFieldName extends keyof TFormValues>(
    fieldName: TFieldName,
    value: TFormValues[TFieldName],
  ) => {
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

  const setValues = (newValues: TFormValues) => {
    if (objectsAreEqual(newValues, prevValues)) {
      return;
    }

    prevValues = { ...values };
    values = { ...newValues };

    _onUpdateHandlers.forEach((cb) => {
      cb(values, prevValues);
    });

    Object.keys(_onUpdateFieldHandlers).forEach((fieldName) => {
      if (prevValues[fieldName] !== values[fieldName]) {
        (_onUpdateFieldHandlers[fieldName] || []).forEach((cb) => {
          cb(values[fieldName], prevValues[fieldName]);
        });
      }
    });

    _onUpdateHandlers.forEach((cb) => {
      cb(values, prevValues);
    });
  };

  const onUpdateField = <TFieldName extends keyof TFormValues>(
    fieldName: TFieldName,
    cb: UpdateFieldHandler<TFormValues[TFieldName]>,
  ) => {
    if (!_onUpdateFieldHandlers[fieldName]) {
      _onUpdateFieldHandlers[fieldName] = [];
    }
    _onUpdateFieldHandlers[fieldName]!.push(cb);
  };

  const offUpdateField = <TFieldName extends keyof TFormValues>(
    fieldName: TFieldName,
    cb: UpdateFieldHandler<TFormValues[TFieldName]>,
  ) => {
    if (!_onUpdateFieldHandlers[fieldName]) {
      _onUpdateFieldHandlers[fieldName] = [];
    }
    _onUpdateFieldHandlers[fieldName] = _onUpdateFieldHandlers[fieldName]!.filter(
      (handler) => handler !== cb,
    );
  };

  const onUpdate = (cb: UpdateHandler<TFormValues>) => {
    _onUpdateHandlers.push(cb);
  };

  const offUpdate = (cb: UpdateHandler<TFormValues>) => {
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
    setValues,
    onUpdateField,
    offUpdateField,
    onUpdate,
    offUpdate,
  };
};
