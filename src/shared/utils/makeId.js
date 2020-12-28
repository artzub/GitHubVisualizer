const defaultAlphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';

/**
 * Make a random ID, similar to a UUID, except with variable length and less complex
 * @param length length of id
 * @param alphabet string of characters to choose from
 */
export const makeId = (length = 10, alphabet = defaultAlphabet) =>
  new Array(length)
    .fill('')
    .map(() => alphabet[ Math.floor(Math.random() * alphabet.length) ])
    .join('');
