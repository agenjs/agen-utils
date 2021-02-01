@agen/utils
===========

This package contains utility methods to work with async generators.
List of methods:
* `batch` - transform a sequence of values to sequence of arrays (batches)
   containing the specified number of elements
* `compose` - compose multiple async generators to just one async generator function
* `each` - performs additional operations before and after the iterated items
* `filter` - removes some values from the parent iterator
* `flatten` - transforms embedded iterable to a flat sequence of elements
  (expands arrays and other generators)
* `map` - transforms items from the parent async generator to new values
* `range` - select the specified range of element from the stream 
* `series` - splits sequence of items to multiple async iterators
  using the provided "split" method


Example:
```javascript
import agen from '@agen/utils';
```


`batch` method
--------------

This method transforms a sequence of individual items to "batches" (arrays)
of the specified size.
This method accepts the following parameters:
* generator - asynchronous generator providing inidvidual elements
* batchSize - size of returned batches; default value is 10

It returns an asynchronous generator providing element batches (arrays)  
of the specified size.

See also the `fixedSize` method. The `batch` method groups individual items in
arrays while `fixedSize` accepts arrays of diffent sizes and align them
to the specified sizes.

Example:
```javascript

import agen from '@agen/utils';

const list = [
  'item-0',
  'item-1',
  'item-2',
  'item-3',
  'item-4',
  'item-5',
  'item-6',
  'item-7'
]
const f = agen.batch(3);
for await (let b of f(list)) {
  console.log('-', b);
}
// Output:
// - ['item-0', 'item-1', 'item-2']
// - ['item-3', 'item-4', 'item-5']
// - ['item-6', 'item-7']
```


`compose` method
----------------
This method allows to combine multiple async generators to single function forming 
transformation pipelines. An iterator created by the first generator passed to 
the second generator function, the result of the second function goes to the third one 
etc. 

Parameters: 
* `...list` - list of async generators to execute one after another. 

Example: 
```javascript
// 
const f = agen.compose(
  agen.filter((v, i) => (i % 2 == 0)), // Filter only even values
  agen.each(                           // Prints "xml" tags
    (v, i) => console.log(`<${v}>`),
    (v, i) => console.log(`</${v}>`),
  ),
  agen.map((v, i) => v.toUpperCase()), // Transforms characters to upper case
);

const list = ['a', 'b', 'c', 'd', 'e'];
for await (let v of f(list)) {
  console.log('  -', v);
}

// Output:
// <a>
//   - A
// </a>
// <c>
//   - C
// </c>
// <e>
//   - E
// </e>

```


`each` method
-------------

Executes specified callback functions before and after each iterated items.
The iterator waits for finishing of the executed callbacks.
The returned async generator don't change the returned items.

This method accepts the following parameters:
* `before` - an optional callback function executed before each iterated item
* `after` - an optional callback function executed after each item

Example:

```javascript
import agen from '@agen/utils';

// Prepare the mapping function
 const f = agen.each(
   (v, i) => console.log(`- before [${i}:${v}]`),
   (v, i) => console.log(`- after [${i}:${v}]`)
 );

// Iterate over a list of values
 const list = [ 'a', 'b', 'c' ]
 for await (let value of f(list)) {
   console.log('  - ', value);
 }
// Will print
// - before [0:a]
//   - a
// - after [0:a]
// - before [1:b]
//   - b
// - after [1:b]
// - before [2:c]
//   - c
// - after [2:c]
```

`filter` method
---------------

Filters (removes) individual items from parent async generator.

This method accepts the following parameters:
* `accept` - function checking individual elements; if this method returns `true` then
  this element appears in the resulting sequence; Filters function takes two parameters:
  - item to check
  - current item index

It returns an asynchronous generator providing accepted elements.

Example 1: filtering by the element value
```javascript
import agen from '@agen/utils';

const list = [
  'First Message',
  'Hello world',
  'Second Message',
  'Hello John Smith'
]
const f = agen.filter((v, i) => v.indexOf('Hello') >= 0)
for await (let item of f(list)) {
  console.log('-', item);
}
// Output:
// - Hello world
// - Hello John Smith
```

Example 2: filtering by the element index
```javascript
import agen from '@agen/utils';

const list = [
  'item-0',
  'item-1',
  'item-2',
  'item-3',
  'item-4',
  'item-5',
  'item-6',
  'item-7'
]
const f = agen.filter((v, i) => i % 2 === 0);
for await (let item of f(list)) {
  console.log('-', item);
}
// Output:
// - item-0
// - item-2
// - item-4
// - item-6
```

`flatten` method
----------------

Transforms list of "embedded" iterables to a flat sequence of values.

 ```javascript
import agen from '@agen/utils';

const list = [
  'a', 
  ['b', [['c', 'd'], [['e']], 'f'], 'g'], 
  ['h', [['i'], 'j'], 'k']
];
const f = agen.flatten();
for await (let v of f(list)) {
  console.log('-', v);
}
// Output:
// - a
// - b
// - c
// - d
// - ...
```

`map` method
------------

Transform items from the parent async generator to new values.

This method accepts the following parameters:
* `mapper` - method transforming the initial item


It returns an asynchronous generator providing transformed items.

Example:

```javascript
import agen from '@agen/utils';

// Prepare the mapping function
 const f = agen.map((v, i) => v.toUpperCase());

// Iterate over a list of transformed values
 const list = [ 'a', 'b', 'c' ]
 for await (let item of f(list)) {
   console.log('-', item);
 }
// Output:
// - A
// - B
// - C
```

`range` method
--------------

The `range` method returns specified range of items from the parent async generator.

This method accepts the following parameters:
* idx - minimal index of the returned elements; 0 by default
* count - number of elements to return; Inifinity by default

It returns an asynchronous generator providing items from the specified range.

Example:
```javascript

import agen from '@agen/utils';

const f = agen.range(1, 3);
const list = [ 'a', 'b', 'c', 'd', 'e', 'f' ]
for await (let item of f(list)) {
  console.log('-', item);
}
// Output:
// - b
// - c
// - d
```

`series` method
---------------

Splits sequence of items to multiple async iterators using the provided "split" method. The resulting generator returns iterables for each serie of values.

Parameter:
* `splitter` - a method returning `true` when elements should be sent  in a new iterator

Example:
```javascript
import agen from '@agen/utils';

let prevYear;
// Split cars by year
const f = agen.range((v, i) => {
  const split = prevYear && (prevYear !== v.year);
  prevYear = v.year;
  return split;
})

// See https://en.wikipedia.org/wiki/Car_of_the_Year
const cars = [
  { year: 2005, name : "Audi A6" },
  { year: 2006, name : "BMW 3 Series" },
  { year: 2006, name : "Porsche Cayman S" },
  { year: 2007, name : "Lexus LS 460" },
  { year: 2007, name : "Audi RS4" },
  { year: 2007, name : "Mercedes-Benz E320 Bluetec" },
];
for await (let serie of f(cars)) {
  console.log('----------------------');
  for await (let car of serie) {
    console.log('-', car.year, car.name);
  }
}
// Output:
// ----------------------
// - 2005 Audi A6
// ----------------------
// - 2006 BMW 3 Series
// - 2006 Porsche Cayman S
// - 2006 Honda Civic Hybrid
// ----------------------
// - 2007 Lexus LS 460
// - 2007 Audi RS4
// - 2007 Mercedes-Benz E320 Bluetec
/
```
