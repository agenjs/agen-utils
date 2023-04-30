import agen from '../index.js';

const firstName = agen.slot("John");
const lastName = agen.slot("Smith");
const fullName = agen.select({
  firstName,
  lastName,
}, (o) => `${o.firstName} ${o.lastName}`);

await new Promise((r) => setTimeout(r));
console.log('-', fullName.value);
// Output:
// - John Smith

firstName.value = 'James';
lastName.value = 'Bond';
await new Promise((r) => setTimeout(r));
console.log('-', fullName.value);
// Output:
// - James Bond