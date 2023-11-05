type UpdateHandler = (
  values: Record<string, any>,
  prevValues: Record<string, any>,
) => void;
type UpdateFieldHandler = (newValue: any, oldValue: any) => void;

export interface Form {
  values: Record<string, any>;
  _prevValues: Record<string, any>;
  _onUpdateHandlers: UpdateHandler[];
  _onUpdateFieldHandlers: Record<string, UpdateFieldHandler[]>;

  setValue: (fieldName: string, value: any) => void;
  onUpdateField: (fieldName: string, cb: UpdateFieldHandler) => void;
  offUpdateField: (fieldName: string, cb: UpdateFieldHandler) => void;
  onUpdate: (cb: UpdateHandler) => void;
  offUpdate: (cb: UpdateHandler) => void;
}

export const createForm = (initialValues: Record<string, any>): Form => {
  return {
    values: { ...initialValues },
    _prevValues: {},
    _onUpdateHandlers: [],
    _onUpdateFieldHandlers: {},

    setValue(fieldName: string, value: any) {
      const prevValue = this.values[fieldName];

      if (value !== prevValue) {
        this._prevValues = { ...this.values };
        this.values = {
          ...this.values,
          [fieldName]: value,
        };

        (this._onUpdateFieldHandlers[fieldName] || []).forEach((cb) => {
          cb(value, prevValue);
        });

        this._onUpdateHandlers.forEach((cb) => {
          cb(this.values, this._prevValues);
        });
      }
    },

    onUpdateField(fieldName: string, cb: UpdateFieldHandler) {
      this._onUpdateFieldHandlers[fieldName] =
        this._onUpdateFieldHandlers[fieldName] || [];
      this._onUpdateFieldHandlers[fieldName].push(cb);
    },

    offUpdateField(fieldName: string, cb: UpdateFieldHandler) {
      this._onUpdateFieldHandlers[fieldName] =
        this._onUpdateFieldHandlers[fieldName] || [];
      this._onUpdateFieldHandlers[fieldName] = this._onUpdateFieldHandlers[
        fieldName
      ].filter((handler) => handler !== cb);
    },

    onUpdate(cb: UpdateHandler) {
      this._onUpdateHandlers.push(cb);
    },

    offUpdate(cb: UpdateHandler) {
      this._onUpdateHandlers = this._onUpdateHandlers.filter(
        (handler) => handler !== cb,
      );
    },
  };
};
