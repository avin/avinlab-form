export function detectCardType(number: string): string | undefined {
  const firstDigit = parseInt(number.substring(0, 1), 10);
  const firstTwoDigits = parseInt(number.substring(0, 2), 10);
  const firstThreeDigits = parseInt(number.substring(0, 3), 10);
  const firstFourDigits = parseInt(number.substring(0, 4), 10);
  const firstSixDigits = parseInt(number.substring(0, 6), 10);

  if (firstDigit === 4) {
    return 'Visa';
  }

  if (firstTwoDigits >= 51 && firstTwoDigits <= 55) {
    return 'MasterCard';
  }

  if (firstTwoDigits === 34 || firstTwoDigits === 37) {
    return 'American Express';
  }

  if (
    firstFourDigits === 6011 ||
    (firstSixDigits >= 622126 && firstSixDigits <= 622925) ||
    (firstThreeDigits >= 644 && firstThreeDigits <= 649) ||
    firstTwoDigits === 65
  ) {
    return 'Discover';
  }

  if (firstFourDigits >= 3528 && firstFourDigits <= 3589) {
    return 'JCB';
  }

  return undefined;
}
