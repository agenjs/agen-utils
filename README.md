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
* [listen](#listen-method) - runs an iteration cycle and notify about recieved values to the provided observer object or a callback method
* [listenAll](#listenall-method) - listen multiple iterators and notifies the registered observer about each new combination of returned values; accepts a list of iterators/generators or an object with iterators as fields
* [map](#map-method) - transforms items from the parent async generator to new values
* [multiplexer](#multiplexer-method) - allows to "multiply" values returned by one iterator between multiple listeners; it is a kind of "fork" method.
* [range](#range-method) - select the specified range of element from the stream 
* [series](#series-method) - splits sequence of items to multiple async iterators using the provided "split" method
* [slot](#slot-method) - creates a new async generator function containing all observer methods (`next`, `complete` and `error`) as well as the `value` property; these methods and fields can be used to provide new values dispatched between multiple slot readers
* [use](#use-method) - an alias for the [listenAll](#listenall-method) method

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

`listen` method
---------------

This is a synchronious method running internally iteration cycles and notifying about recieved values to the provided observer object or a callback function.

This method accepts the following parameters:
* `it` - async iterator providing new values
* `observer` - an async callback function or an observer object with the following methods: 
  - `async next(value)` - this method is called when a new value provided by the iterator
  - `async complete()` - optional method to call at the end of iterations
  - `async error(err)` - options method called if an error was thrown during interations

Returns a function interrupting iterations.

Example:

```javascript
import agen from '@agen/utils';

// Prepare the mapping function
const list = [ 'a', 'b', 'c' ]
const cleanup = agen.listen(list, (v) => console.log('-', v));
// ...
await new Promise(r => setTimeout(r, 100));
cleanup();

// Output:
// - a
// - b
// - c
```


`listenAll` method
---------------

This method listens multiple iterators and notifies the registered observer about each new combination of returned values; accepts a list of iterators/generators or an object with iterators as fields.

Parameters:
* `generators` - list of iterators or an object containing iterators as fields; if this is an object then the registered observer will recieve iterated values as object fields
* `observer` - an async callback function or an observer object with the following methods: 
  - `async next(value)` - this method is called when a new value provided by the iterator
  - `async complete()` - optional method to call at the end of iterations
  - `async error(err)` - options method called if an error was thrown during interations

Returns a function interrupting iterations.

Example 1: listen iterators arrays

```javascript
import agen from '@agen/utils';

// Prepare the mapping function
const numbers = [ '007', '000', '008' ]
const names = [ 'James Bond', 'John Smith' ]
const cleanup = agen.listenAll([
  toAsyncIterator(numbers),
  toAsyncIterator(names)
], (v) => console.log('-', v));
// ...
await new Promise(r => setTimeout(r, 100));
cleanup();
// Output:
// - [ '007', undefined ]
// - [ '007', 'James Bond' ]
// - [ '000', 'James Bond' ]
// - [ '000', 'John Smith' ]
// - [ '008', 'John Smith' ]

```

Example 2: listen objects with iterators

```javascript
import agen from '@agen/utils';

// Prepare the mapping function
const numbers = [ '007', '000', '008' ]
const names = [ 'James Bond', 'John Smith' ]

cleanup = agen.listenAll({
  number : toAsyncIterator(numbers),
  name : toAsyncIterator(names)
}, (v) => console.log('-', v));
// ...
await new Promise(r => setTimeout(r, 100));
cleanup();
// Output:
// - { number: '007', name: undefined }
// - { number: '007', name: 'James Bond' }
// - { number: '000', name: 'James Bond' }
// - { number: '000', name: 'John Smith' }
// - { number: '008', name: 'John Smith' }
```

Utility function used  in these examples:
```js
// Utility method transforming arrays to async iterators
async function* toAsyncIterator(list, delay = 10) {
  for await (const value of list) {
    await new Promise((r) => setTimeout(r, Math.round(Math.random(delay))));
    yield value;
  }
}

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

This method returns an async generator function allowing to dispatch values returned by the intial iterator between multiple consumers (iterators). 
Note that the root iterator wait until *all* iterators
consume the provided value. So the speed of value generation is 
defined by the slowest consumer.
This method starts to load values provided by the root iterator only when the first consumer starts to read values and interrupts root iterations when the last consumer stops iterations.


This method accepts the following parameters:
* `iterator` - the root iterator providing values to dispatch
* `newQueue` - a factory function returning a queue object with `push` and `shift` methods; by default it will be a simple array
* `awaitNew` - (default: `false`) if this flag is `true` then newly created iterators will wait for the next value returned by the root iterator; otherwise the new iterators recieve already defined value if the iterations already started.

This function returns a new async generator giving access to values generated by the root iterator.

Example:

```javascript
import agen from '@agen/utils';

// Generate new values:
async function* toAsyncIterator(list, delay = 100) {
  for await (const value of list) {
    yield value;
    await new Promise((r) => setTimeout(r, delay));
  }
}

const iterator = toAsyncIterator(["Hello", "World", "!"]);
const f = agen.multiplexer(iterator);

// Consume values in three different "threads".

// First consumer (the slowest one):
(async () => {
  for await (let value of f()) {
    console.log("* FIRST:", value);
    await new Promise((r) => setTimeout(r, 300));
  }
})();

// Second consumer:
(async () => {
  for await (let value of f()) {
    console.log("* SECOND:", value);
  }
})();

// Third consumer:
(async () => {
  for await (let value of f()) {
    console.log("* THIRD:", value);
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


`slot` method
---------------

Creates a new async generator function containing all observer methods (`next`, `complete` and `error`) as well as the `value` property; these methods and fields can be used to provide new values dispatched between multiple slot readers.

Parameter:
* `value` - initial value returned by this slot
* `newQueue` - the queue used to schedule new values handling; by default it uses the `newSkipQueue` keeping only the last enqueued value and discarding all values provided while the previous values are handled by consumers

Returns an async generator function dispatching the same values between multiple readers. The returned slot contains the following methods and fields:
* Observable methods:
  * `async next(val)` - pushes the new value to all listeners
  * `async complete()`  - finalizes iterations and notifies all listeners about it
  * `async error(err)` - notify about an error and interrupts iterations
* Fields:
  * `value` - read/write field giving access to the last slot value
  * `promise` - a promise resolved when the main iterator is finished

Each iteration process can provide its own callback function transforming the iterated values (see example below).

Example:
```javascript
import agen from '@agen/utils';

// Create a new slot with the empty (undefined) value:
const slot = agen.slot();

// Create multiple readers of this slot:

// First reader iterates over values returned by the slot and transforms them to upper case strings.
const firstConsumerPromise = (async () => {
  // This consumer will transform the returned string to upper case: 
  const transform = (s = '')  => s.toUpperCase();
  for await (const value of slot(transform)) {
    console.log('- First Reader:', value);
  }
})();

// The second consumer transforms string to the lower case:
const secondConsumerPromise = (async () => {
  const transform = (s = '')  => s.toLowerCase();
  for await (const value of slot(transform)) {
    console.log('- Second Reader:', value);
  }
})();

// Now we can provide values to the slot:
const providerPromise = (async () => {
  const names = ["James Bond", "John Smith"];
  for (let i = 0; i < names.length; i++) {
    slot.value = names[i];

    // We can also use the `next` function for that. 
    // It allows to wait until all consumers handle the provided value.
    //// await slot.next(array[i]);
    await new Promise(r => setTimeout(r, 10));
  }
  // Call the `complete` method to interrupt iterations 
  // for all consumers.
  slot.complete();
})();

Promise.resolve().then(() => Promise.all([
  firstConsumerPromise,
  secondConsumerPromise,
  providerPromise
]));

// Output:
// - First Reader: JAMES BOND
// - Second Reader: james bond
// - First Reader: JOHN SMITH
// - Second Reader: john smith
```


`use` method
------------

This is an alias for the [listenAll](#listenall-method) method. See documentation there.
