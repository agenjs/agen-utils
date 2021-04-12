import iterator from './iterator.js';
export default function iterate(init, ...args) { return iterator(init)(...args); }