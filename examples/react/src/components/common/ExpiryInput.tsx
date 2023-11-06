import React from 'react';
import { MaskInput } from './MaskInput.tsx';
import IMask from 'imask';

const maskOptions = {
  mask: 'MM/YY',
  blocks: {
    MM: {
      mask: IMask.MaskedRange,
      from: 1,
      to: 12,
      maxLength: 2,
      autofix: 'pad',
    },
    YY: {
      mask: IMask.MaskedRange,
      from: 0,
      to: 99,
      maxLength: 2,
      autofix: 'pad',
    },
  },
  eager: true,
};

interface Props extends Omit<$ElementProps<typeof MaskInput>, 'maskOptions'> {}

export default function ExpiryInput(props: Props) {
  return <MaskInput maskOptions={maskOptions} {...props} />;
}
