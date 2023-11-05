import React from 'react';
import { MaskInput } from './MaskInput.tsx';

const maskOptions = {
  mask: '0000 0000 0000 0000 000',
};

interface Props extends Omit<$ElementProps<typeof MaskInput>, 'maskOptions'> {}

export function PanInput(props: Props) {
  return (
    <MaskInput maskOptions={maskOptions} beforeChange={(v) => v.replace(/\s/g, '')} {...props} />
  );
}
