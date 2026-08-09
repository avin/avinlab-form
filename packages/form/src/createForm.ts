export type FormValues = Record<string, any>;
type FormSnapshot<TFormValues extends FormValues> = Readonly<TFormValues>;

declare const __DEV__: boolean;

export type UpdateHandler<TFormValues extends FormValues> = (
  values: FormSnapshot<TFormValues>,
  prevValues: FormSnapshot<TFormValues>,
) => void;
type UpdateFieldHandler<T> = (newValue: T, oldValue: T) => void;
type Unsubscribe = () => void;

export interface Form<TFormValues extends FormValues> {
  readonly values: FormSnapshot<TFormValues>;
  readonly prevValues: FormSnapshot<TFormValues>;
  setValue: <TFieldName extends keyof TFormValues>(
    fieldName: TFieldName,
    value: TFormValues[TFieldName],
  ) => void;
  setValues: (values: TFormValues) => void;
  /**
   * Subscribes to commits that change this field. Listener membership is captured at the start of
   * each successful commit, so subscription changes during notification apply to the next commit.
   */
  subscribeField: <TFieldName extends keyof TFormValues>(
    fieldName: TFieldName,
    cb: UpdateFieldHandler<TFormValues[TFieldName]>,
  ) => Unsubscribe;
  /** @deprecated Prefer `subscribeField`, which returns its cleanup function. */
  onUpdateField: <TFieldName extends keyof TFormValues>(
    fieldName: TFieldName,
    cb: UpdateFieldHandler<TFormValues[TFieldName]>,
  ) => void;
  /** @deprecated Keep the cleanup returned by `subscribeField` instead. */
  offUpdateField: <TFieldName extends keyof TFormValues>(
    fieldName: TFieldName,
    cb: UpdateFieldHandler<TFormValues[TFieldName]>,
  ) => void;
  /**
   * Subscribes to successful form commits. Listener membership is captured at the start of each
   * commit, so subscription changes during notification apply to the next commit.
   */
  subscribe: (cb: UpdateHandler<TFormValues>) => Unsubscribe;
  /** @deprecated Prefer `subscribe`, which returns its cleanup function. */
  onUpdate: (cb: UpdateHandler<TFormValues>) => void;
  /** @deprecated Keep the cleanup returned by `subscribe` instead. */
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
  const _onUpdateHandlers = new Set<UpdateHandler<TFormValues>>();
  const _onUpdateFieldHandlers = new Map<string, Set<UpdateFieldHandler<any>>>();
  const normalizeFieldName = (fieldName: keyof TFormValues) => String(fieldName);
  const updateQueue: Array<(currentValues: FormSnapshot<TFormValues>) => TFormValues> = [];
  let isProcessingUpdates = false;
  const attemptListener = <TArgs extends unknown[]>(
    listenerFailures: unknown[],
    cb: (...args: TArgs) => void,
    ...args: TArgs
  ) => {
    try {
      cb(...args);
    } catch (error) {
      listenerFailures.push(error);
    }
  };

  const commit = (createNextValues: (currentValues: FormSnapshot<TFormValues>) => TFormValues) => {
    updateQueue.push(createNextValues);

    if (isProcessingUpdates) {
      return;
    }

    isProcessingUpdates = true;
    const listenerFailures: unknown[] = [];

    try {
      while (updateQueue.length > 0) {
        const queuedUpdate = updateQueue.shift();

        if (queuedUpdate) {
          listenerFailures.push(...commitNextValues(queuedUpdate(values)));
        }
      }
    } finally {
      isProcessingUpdates = false;
    }

    if (listenerFailures.length === 1) {
      throw listenerFailures[0];
    }

    if (listenerFailures.length > 1) {
      throw new AggregateError(listenerFailures, 'Multiple form listeners failed');
    }
  };

  const commitNextValues = (nextValues: TFormValues) => {
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
      return [];
    }

    const committedPrevValues = values;
    const committedValues = createSnapshot(nextValues);
    const fieldNotifications = changedFieldNames.map(
      (fieldName) =>
        [
          fieldName,
          [...(_onUpdateFieldHandlers.get(normalizeFieldName(fieldName)) || [])],
        ] as const,
    );
    const formUpdateHandlers = [..._onUpdateHandlers];
    prevValues = committedPrevValues;
    values = committedValues;
    const listenerFailures: unknown[] = [];

    fieldNotifications.forEach(([fieldName, handlers]) => {
      handlers.forEach((cb) => {
        attemptListener(
          listenerFailures,
          cb,
          committedValues[fieldName],
          committedPrevValues[fieldName],
        );
      });
    });

    formUpdateHandlers.forEach((cb) => {
      attemptListener(listenerFailures, cb, committedValues, committedPrevValues);
    });

    return listenerFailures;
  };

  const setValue = <TFieldName extends keyof TFormValues>(
    fieldName: TFieldName,
    value: TFormValues[TFieldName],
  ) => {
    commit((currentValues) => {
      const nextValues: TFormValues = { ...currentValues, [fieldName]: value };

      return nextValues;
    });
  };

  const setValues = (newValues: TFormValues) => {
    const requestedValues: TFormValues = { ...newValues };
    commit(() => requestedValues);
  };

  const subscribeField = <TFieldName extends keyof TFormValues>(
    fieldName: TFieldName,
    cb: UpdateFieldHandler<TFormValues[TFieldName]>,
  ) => {
    const normalizedFieldName = normalizeFieldName(fieldName);
    let handlers = _onUpdateFieldHandlers.get(normalizedFieldName);

    if (!handlers) {
      handlers = new Set();
      _onUpdateFieldHandlers.set(normalizedFieldName, handlers);
    }
    handlers.add(cb);

    return () => {
      _onUpdateFieldHandlers.get(normalizedFieldName)?.delete(cb);
    };
  };

  const onUpdateField = <TFieldName extends keyof TFormValues>(
    fieldName: TFieldName,
    cb: UpdateFieldHandler<TFormValues[TFieldName]>,
  ) => {
    subscribeField(fieldName, cb);
  };

  const offUpdateField = <TFieldName extends keyof TFormValues>(
    fieldName: TFieldName,
    cb: UpdateFieldHandler<TFormValues[TFieldName]>,
  ) => {
    _onUpdateFieldHandlers.get(normalizeFieldName(fieldName))?.delete(cb);
  };

  const subscribe = (cb: UpdateHandler<TFormValues>) => {
    _onUpdateHandlers.add(cb);

    return () => {
      _onUpdateHandlers.delete(cb);
    };
  };

  const onUpdate = (cb: UpdateHandler<TFormValues>) => {
    subscribe(cb);
  };

  const offUpdate = (cb: UpdateHandler<TFormValues>) => {
    _onUpdateHandlers.delete(cb);
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
    subscribeField,
    onUpdateField,
    offUpdateField,
    subscribe,
    onUpdate,
    offUpdate,
  };
};
