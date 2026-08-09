export type FormValues = Record<string, any>;
type FormSnapshot<TFormValues extends FormValues> = Readonly<TFormValues>;

declare const __DEV__: boolean;

type FieldUpdateHandlers<T> = {
  [K in keyof T]?: UpdateFieldHandler<T[K]>[];
};

export type UpdateHandler<TFormValues extends FormValues> = (
  values: FormSnapshot<TFormValues>,
  prevValues: FormSnapshot<TFormValues>,
) => void;
type UpdateFieldHandler<T> = (newValue: T, oldValue: T) => void;

export interface Form<TFormValues extends FormValues> {
  readonly values: FormSnapshot<TFormValues>;
  readonly prevValues: FormSnapshot<TFormValues>;
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
  const createSnapshot = (nextValues: TFormValues): FormSnapshot<TFormValues> => {
    const snapshot = { ...nextValues };
    const isDevelopment = typeof __DEV__ === 'undefined' || __DEV__;

    return isDevelopment ? Object.freeze(snapshot) : snapshot;
  };

  let values = createSnapshot(initialValues);
  let prevValues = createSnapshot(initialValues);
  let _onUpdateHandlers: UpdateHandler<TFormValues>[] = [];
  let _onUpdateFieldHandlers: FieldUpdateHandlers<TFormValues> = {};

  const commit = (nextValues: TFormValues) => {
    const nextFieldNames = Object.keys(nextValues) as (keyof TFormValues)[];
    const currentFieldNames = Object.keys(values) as (keyof TFormValues)[];
    const changedNextFieldNames = nextFieldNames.filter(
      (fieldName) =>
        !Object.prototype.hasOwnProperty.call(values, fieldName) ||
        !Object.is(nextValues[fieldName], values[fieldName]),
    );
    const removedFieldNames = currentFieldNames.filter(
      (fieldName) => !Object.prototype.hasOwnProperty.call(nextValues, fieldName),
    );
    const changedFieldNames = [...changedNextFieldNames, ...removedFieldNames];

    if (changedFieldNames.length === 0) {
      return;
    }

    const committedPrevValues = values;
    const committedValues = createSnapshot(nextValues);
    prevValues = committedPrevValues;
    values = committedValues;

    changedFieldNames.forEach((fieldName) => {
      (_onUpdateFieldHandlers[fieldName] || []).forEach((cb) => {
        cb(committedValues[fieldName], committedPrevValues[fieldName]);
      });
    });

    _onUpdateHandlers.forEach((cb) => {
      cb(committedValues, committedPrevValues);
    });
  };

  const setValue = <TFieldName extends keyof TFormValues>(
    fieldName: TFieldName,
    value: TFormValues[TFieldName],
  ) => {
    const nextValues: TFormValues = { ...values, [fieldName]: value };
    commit(nextValues);
  };

  const setValues = (newValues: TFormValues) => {
    commit(newValues);
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
