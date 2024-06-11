import * as agen from "../dist/index.js";

let prevYear;
// Split cars by year
const f = agen.series((v, i) => {
  const split = prevYear && prevYear !== v.year;
  prevYear = v.year;
  return split;
});

// See https://en.wikipedia.org/wiki/Car_of_the_Year
const cars = [
  { year: 2005, name: "Audi A6" },
  { year: 2006, name: "BMW 3 Series" },
  { year: 2006, name: "Porsche Cayman S" },
  { year: 2006, name: "Honda Civic Hybrid" },
  { year: 2006, name: "Citroën C4" },
  { year: 2007, name: "Lexus LS 460" },
  { year: 2007, name: "Audi RS4" },
  { year: 2007, name: "Mercedes-Benz E320 Bluetec" },
  { year: 2007, name: "Audi TT" },
  { year: 2008, name: "Mazda2 / Demio" },
  { year: 2008, name: "Audi R8" },
  { year: 2008, name: "BMW 118d" },
  { year: 2008, name: "Audi R8" },
  { year: 2009, name: "Volkswagen Golf Mk6" },
  { year: 2009, name: "Nissan GT-R" },
  { year: 2009, name: "Honda FCX Clarity" },
  { year: 2009, name: "Fiat Nuova 500" },
];
for await (let serie of f(cars)) {
  console.log("----------------------");
  for await (let car of serie) {
    console.log("-", car.year, car.name);
  }
}
// Output:
// ----------------------
// - 2005 Audi A6
// ----------------------
// - 2006 BMW 3 Series
// - 2006 Porsche Cayman S
// - 2006 Honda Civic Hybrid
// - 2006 Citroën C4
// ----------------------
// - 2007 Lexus LS 460
// - 2007 Audi RS4
// - 2007 Mercedes-Benz E320 Bluetec
// - 2007 Audi TT
// ----------------------
// - 2008 Mazda2 / Demio
// - 2008 Audi R8
// - 2008 BMW 118d
// - 2008 Audi R8
// ----------------------
// - 2009 Volkswagen Golf Mk6
// - 2009 Nissan GT-R
// - 2009 Honda FCX Clarity
// - 2009 Fiat Nuova 500
