import React, { useMemo, useState } from 'react';
import { detectCardType } from '../utils/detectCardType.ts';

interface Props extends React.ComponentPropsWithoutRef<'div'> {
  cardNumber: string;
}

export function PaymentSystem({ cardNumber, ...props }: Props) {
  const paymentSystem = useMemo(() => {
    return detectCardType(cardNumber);
  }, [cardNumber]);

  return <div {...props}>{paymentSystem}</div>;
}
