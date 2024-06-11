import { describe, it, expect } from "./deps.ts";
import agen from "../index.ts";
describe("series(splitter) ", () => {
  it("should split sequence of values to series", async () => {
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

    let prevYear;
    // Split cars by year
    const f = agen.series((v, i) => {
      const split = prevYear && prevYear !== v.year;
      prevYear = v.year;
      return split;
    });

    const result = [];
    for await (let serie of f(cars)) {
      const batch = [];
      result.push(batch);
      for await (let car of serie) {
        batch.push(car);
      }
    }

    expect(result).toEqual([
      [{ year: 2005, name: "Audi A6" }],
      [
        { year: 2006, name: "BMW 3 Series" },
        { year: 2006, name: "Porsche Cayman S" },
        { year: 2006, name: "Honda Civic Hybrid" },
        { year: 2006, name: "Citroën C4" },
      ],
      [
        { year: 2007, name: "Lexus LS 460" },
        { year: 2007, name: "Audi RS4" },
        { year: 2007, name: "Mercedes-Benz E320 Bluetec" },
        { year: 2007, name: "Audi TT" },
      ],
      [
        { year: 2008, name: "Mazda2 / Demio" },
        { year: 2008, name: "Audi R8" },
        { year: 2008, name: "BMW 118d" },
        { year: 2008, name: "Audi R8" },
      ],
      [
        { year: 2009, name: "Volkswagen Golf Mk6" },
        { year: 2009, name: "Nissan GT-R" },
        { year: 2009, name: "Honda FCX Clarity" },
        { year: 2009, name: "Fiat Nuova 500" },
      ],
    ]);
  });
});
