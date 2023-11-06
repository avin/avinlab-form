import React from 'react';
import { MaskInput } from './MaskInput.tsx';

const maskOptions = {
  mask: '0000',
};

interface Props extends Omit<$ElementProps<typeof MaskInput>, 'maskOptions'> {}

export function CvcInput(props: Props) {
  return <MaskInput maskOptions={maskOptions} {...props} />;
}
