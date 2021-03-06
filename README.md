@agen/utils
===========

*Note* An interactive version of this documentation can be found here:
https://observablehq.com/@kotelnikov/agen-utils

This package contains utility methods to work with async generators.
List of methods:
* [batch](#batch-method) - transform a sequence of values to sequence of arrays (batches)
   containing the specified number of elements
* [compose](#compose-method) - compose multiple async generators to just one async generator function
* [each](#each-method) - performs additional operations before and after the iterated items
* [filter](#filter-method) - removes some values from the parent iterator
* [flatten](#flatten-method) - transforms embedded iterable to a flat sequence of elements
  (expands arrays and other generators)
* [fin](#fin-method) - calls a callback function when all iterations are finished/interrupted even in 
  the case of exceptions
* [interrupt](#interrupt-method) - interrupts iterations when the specified callback method returns `false`
* [iterator](#iterator-method) - creates a new async iterator function by pushing values using 
  methods `next`, `error` and `complete` (similar with Observers).
  This method manages backpressure and allows to wait objects delivery
  to stream consumers.
* [iterate](#iterate-method) - creates and invoke a new async iterator; it is a "shortcut" 
  for the `iterator(init)()` call.
* [map](#map-method) - transforms items from the parent async generator to new values
* [multiplexer](#multiplexer-method) - allows to create multiple iterable consuming values generated
  by one provider; it is a kind of "fork" method.
* [range](#range-method) - select the specified range of element from the stream 
* [series](#series-method) - splits sequence of items to multiple async iterators
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

`fin` method
------------
Calls the specified callback function when all iterations are finished / interrupted.

Parameters:
* `callback`  a callback function accepting two values:
  - `error` an error generated by the sequence; this value is `undefined` if no
    errors were thrown
  - `count` the total number of elements produced by the stream before interruption

Example:
```javascript
import agen from '@agen/utils';
const list = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];
const f = agen.fin((error, count) => {
  console.log(`count: ${count}`);
  console.log(`error: ${error}`);
});
for await (let v of f(list)) { }

// Output:
// count: 11
// error: undefined
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

`interrupt` method
------------------
Returns a new async iterator interrupting when the specified method(s) return `false`.

This method accepts the following parameters:
* `before` - if this method returns `false` then iterations are stopped before yielding 
  the last value to the caller. This callback can be null. In this case the second parameter
  - the `after` callback - is used.
* `after` - if this method returns `false` then iterations are stopped after yielding 
  the checked value.

Both (`before` and `after`) callback method recieve the current value and its index
(position) in the stream.

Example:
```javascript
import agen from '@agen/utils';

// Original data to iterate over:
const list = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];

// Interrupt iterations on the third element
// (just before delivering the third element):
let f = agen.interrupt((value, idx) => idx === 3);
for await (let b of f(list)) {
  console.log(b);
}
// Will print
// - a
// - b 
// - c


console.log('------------');
// Interrupt iterations just after delivering the third value.
// Note that the first callback (`before` function) is `null`:
f = agen.interrupt(null, (value, idx) => idx === 3);
for await (let b of f(list)) {
  console.log(b);
}
// Will print
// ------------
// - a
// - b 
// - c
// - d
```

`iterator` method
-----------------

Create a new async iterator "from scratch" by pushing values in the stream.
This method allows to control backpressure because the observer methods 
return promises resolved when the provided value is consumed at the other side. 

This method accepts the following parameters:
* `handler` - method accepting an observer object with the following methods:
  - `async next(value)` - this method is used to provide new values
  - `async complete()` - this method is used to notify about iteration ends
  - `async error(err)` - this method is used to notify about iteration errors
The handler method can return a function to call when the iteration process 
is interrupted.
  
Example:

```javascript
import agen from '@agen/utils';

// Prepare the mapping function
 const f = agen.iterator((o) => {
   (async () => {
     await o.next('Hello');
     await o.next('World');
     await o.next('!');
     o.complete();
   })();
   return () => console.log('Done')
 });

 for await (let item of f()) {
   console.log('-', item);
 }
// Output:
// - Hello
// - World
// - !
```

`iterate` method
-----------------
See the [iterator](#iterator-method) method.

Creates and invoke a new async iterator.
It is a "shortcut"  the `iterator(init)()` call.

This method allows to control backpressure - the observer methods 
return promises resolved when the provided value is consumed at the other side. 

This method accepts the following parameters:
* `handler` - method accepting an observer object with the following methods:
  - `async next(value)` - this method is used to provide new values
  - `async complete()` - this method is used to notify about iteration ends
  - `async error(err)` - this method is used to notify about iteration errors
The handler method can return a function to call when the iteration process 
is interrupted.
  
Example:

```javascript
import agen from '@agen/utils';

// Creates an async iterator.
// The difference with the agen.terator is that  
// the returned value is the ready to use iterator
// (and not a function to invoke).
const iterator = agen.iterate((o) => {
  (async () => {
    await o.next('Hello');
    await o.next('World');
    await o.next('!');
    o.complete();
  })();
  return () => console.log('Done')
});

for await (let item of iterator) {
  console.log('-', item);
}
// Output:
// - Hello
// - World
// - !
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


`multiplexer` method
--------------------

This method returns an async generator function allowing to create 
multiple consumers (iterators) of the same values. 
Note the provider can push the next value only when *all* iterators
consume the provided value. So the speed of value generation is 
defined by the slowest consumer.

This function is similar with the [[iterator](#iterator-method) method.

This method accepts the following parameters:
* `handler` - method accepting an observer object with the following methods:
  - `async next(value)` - this method is used to provide new values
  - `async complete()` - this method is used to notify about iteration ends
  - `async error(err)` - this method is used to notify about iteration errors
The handler method can return a function to call when the iteration process 
is interrupted.

Example:

```javascript
import agen from '@agen/utils';

// Generate new values:
 const f = agen.multiplexer((o) => {
   (async () => {
     await o.next('Hello');
     await o.next('World');
     await o.next('!');
     await o.complete();
   })();
   return () => console.log('Done')
 });

 // Consume values in three different "threads".

 // First consumer (the slowest one):
 (async () => {
   for await (let value of f()) {
     console.log('* FIRST:', value);
     await new Promise(r => setTimeout(r, 300));
   }
 })();

 // Second consumer:
 (async () => {
   for await (let value of f()) {
     console.log('* SECOND:', value);
   }
 })();

 // Third consumer:
 (async () => {
   for await (let value of f()) {
     console.log('* THIRD:', value);
   }
 })();

// Output:
// * FIRST: Hello
// * SECOND: Hello
// * THIRD: Hello
// * FIRST: World
// * SECOND: World
// * THIRD: World
// * FIRST: !
// * SECOND: !
// * THIRD: !
// Done
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
