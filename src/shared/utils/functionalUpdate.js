/**
 * @param {*|function(prevValue): newValue} updater
 * @param {*} prev
 * @return {*}
 */
export const functionalUpdate = (updater, prev) => {
  return typeof updater === 'function' ? updater(prev) : updater;
};
