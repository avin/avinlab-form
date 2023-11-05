import React, { useEffect, useRef } from 'react';
import IMask from 'imask/esm/imask';
import 'imask/esm/masked/number';

interface Props extends Omit<React.ComponentPropsWithoutRef<'input'>, 'onChange'> {
  maskOptions: any;
  onChange?: (v: string) => void;
  beforeChange?: (v: string) => string;
}

export function MaskInput({ maskOptions, onChange, beforeChange, ...props }: Props) {
  const inputElRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const inputEl = inputElRef.current;

    if (!inputEl) {
      return;
    }

    const mask = IMask(inputEl, maskOptions);

    mask.on('accept', () => {
      if (!onChange) {
        return;
      }
      let val = mask.value;
      if (beforeChange) {
        val = beforeChange(val);
      }
      onChange(val);
    });

    return () => {
      mask.destroy();
    };
  });

  return <input type="text" ref={inputElRef} {...props} />;
}
