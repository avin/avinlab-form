export function objectsAreEqual(objA: any, objB: any): boolean {
  // Проверка идентичности ссылок
  if (objA === objB) {
    return true;
  }

  // Проверка наличия объектов и их типов
  if (
    !objA ||
    !objB ||
    (typeof objA !== 'object' && typeof objB !== 'object')
  ) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  // Если количество ключей не совпадает, объекты разные
  if (keysA.length !== keysB.length) {
    return false;
  }

  // Проверка каждого ключа и значения на эквивалентность
  for (const key of keysA) {
    if (!keysB.includes(key)) {
      return false;
    }

    if (typeof objA[key] === 'object' && typeof objB[key] === 'object') {
      if (!objectsAreEqual(objA[key], objB[key])) {
        return false;
      }
    } else if (objA[key] !== objB[key]) {
      return false;
    }
  }

  return true;
}
