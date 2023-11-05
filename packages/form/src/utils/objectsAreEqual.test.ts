import { describe, it, expect } from 'vitest';
import { objectsAreEqual } from './objectsAreEqual';

describe('objectsAreEqual', () => {
  // Тест на идентичные объекты
  it('returns true for identical objects', () => {
    const obj = { a: 1, b: 2 };
    expect(objectsAreEqual(obj, obj)).toBe(true);
  });

  // Тест на равенство объектов с одинаковыми ключами и значениями
  it('returns true for different objects with same keys and values', () => {
    const objA = { a: 1, b: 2 };
    const objB = { a: 1, b: 2 };
    expect(objectsAreEqual(objA, objB)).toBe(true);
  });

  // Тест на неравенство объектов с разными ключами
  it('returns false for objects with different keys', () => {
    const objA = { a: 1, b: 2 };
    const objB = { a: 1, c: 2 };
    expect(objectsAreEqual(objA, objB)).toBe(false);
  });

  // Тест на неравенство объектов с разными значениями
  it('returns false for objects with same keys but different values', () => {
    const objA = { a: 1, b: 2 };
    const objB = { a: 1, b: 3 };
    expect(objectsAreEqual(objA, objB)).toBe(false);
  });

  // Тест на рекурсивное сравнение объектов
  it('returns true for deeply nested objects that are equal', () => {
    const objA = { a: 1, b: { c: 3 } };
    const objB = { a: 1, b: { c: 3 } };
    expect(objectsAreEqual(objA, objB)).toBe(true);
  });

  // Тест на неравенство вложенных объектов
  it('returns false for deeply nested objects that are not equal', () => {
    const objA = { a: 1, b: { c: 3 } };
    const objB = { a: 1, b: { c: 4 } };
    expect(objectsAreEqual(objA, objB)).toBe(false);
  });

  // Тест на неравенство из-за разного количества ключей
  it('returns false when number of keys is different', () => {
    const objA = { a: 1, b: 2, c: 3 };
    const objB = { a: 1, b: 2 };
    expect(objectsAreEqual(objA, objB)).toBe(false);
  });

  // Тест на сравнение объектов с различными типами значений
  it('returns false when objects have different types of values', () => {
    const objA = { a: 1, b: '2' };
    const objB = { a: 1, b: 2 };
    expect(objectsAreEqual(objA, objB)).toBe(false);
  });

  // Тест на сравнение объектов, когда один из аргументов не объект
  it('returns false when one of the arguments is not an object', () => {
    const objA = { a: 1 };
    const notAnObj = null;
    expect(objectsAreEqual(objA, notAnObj as any)).toBe(false);
  });
});
