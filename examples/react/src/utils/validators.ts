export const validatePan = (val: string) => {
  const reverseNumber = val.replace(/\D/g, '').split('').reverse();

  if (reverseNumber.length < 16 || reverseNumber.length > 19) {
    return false;
  }

  let sum = 0;

  for (let i = 0; i < reverseNumber.length; i++) {
    let digit = parseInt(reverseNumber[i], 10);

    // Удвоение каждой второй цифры
    if (i % 2 !== 0) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
  }

  // Если сумма кратна 10, номер карты действителен
  return sum % 10 === 0;
};

export const validateExpiry = (val: string) => {
  // Проверка соответствия формату MM/YY
  const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
  if (!regex.test(val)) {
    return false;
  }

  // Разделение строки на месяц и год
  const [month, year] = val.split('/').map((num) => parseInt(num, 10));

  // Получение текущей даты
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Месяцы начинаются с 0
  const currentYear = currentDate.getFullYear() % 100; // Получение последних двух цифр года

  return !(year < currentYear || (year === currentYear && month < currentMonth));
};

export const validateCvc = (val: string) => {
  const valLength = val.length;
  return valLength >= 3 && valLength <= 4;
};
