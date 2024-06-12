const { describe, test, beforeEach } = require('node:test');
const assert = require('node:assert');
const { Iter } = require('./iter');

let iterator;
let side_effects;

beforeEach(() => {
    iterator = new Iter([1, 5, 3, 9, 7]);
    side_effects = [];
});

describe('Iter Basic Methods', () => {  
    test('next() should return the next element', () => {
        assert.strictEqual(iterator.next(), 1);
        assert.strictEqual(iterator.next(), 5);
    });

    test('has_next() should return true if there are more elements', () => {
        iterator.next();
        iterator.next();
        assert.strictEqual(iterator.has_next(), true);
        iterator.next();
        iterator.next();
        iterator.next();
        assert.strictEqual(iterator.has_next(), false);
    });

    test('prev() should return the previous element', () => {
        iterator.next();
        iterator.next();
        assert.strictEqual(iterator.prev(), 5);
        assert.strictEqual(iterator.prev(), 1);
    });

    test('has_prev() should return true if there are previous elements', () => {
        iterator.next();
        assert.strictEqual(iterator.has_prev(), true);
        iterator.prev();
        assert.strictEqual(iterator.has_prev(), false);
    });

    test('reset() should reset the iterator to its initial state', () => {
        iterator.next();
        iterator.next(); 
        iterator.reset();
        assert.strictEqual(iterator.has_next(), true);
        assert.strictEqual(iterator.has_prev(), false);
        assert.strictEqual(iterator.next(), 1);
    });
});

describe('Iter Map Methods', () => { 
    test('map() with next() should return the next modified element', () => {
        iterator.map((value) => value * 2);
        assert.strictEqual(iterator.next(), 2);
        assert.strictEqual(iterator.next(), 10);
    });

    test('map() with collect() should return an array of modified elements', () => {
        iterator.map((value) => value * 2);
        assert.deepStrictEqual(iterator.collect(), [2, 10, 6, 18, 14]);
    });

});

describe('Iter Filter Methods', () => { 
    test('filter() with collect() should return an array of filtered elements', () => {
        iterator.filter((value) => value > 4);
        assert.deepStrictEqual(iterator.collect(), [5, 9, 7]);
    });
    
    test('filter() with next() should return the next filtered element', () => {
        iterator.filter((value) => value > 4);
        assert.strictEqual(iterator.next(), 5);
        assert.strictEqual(iterator.next(), 9);
    });

    test('find() should return the first element that satisfies the condition', () => {
        assert.strictEqual(iterator.find((value) => value < 9), 1);
    });

    test('find() with find() should return the first element that satisfies both conditions', () => {
        assert.strictEqual(iterator.find((value) => value < 9), 1);
        assert.strictEqual(iterator.find((value) => value > 4), 5);
    });

    test('Combining map() and find()', () => {
        iterator.map((value) => value * 2);
        assert.strictEqual(iterator.find((value) => value > 10), 18);
    });

});

describe('Iter Some / Every Methods', () => { 
    test('some() should return true if any element satisfies the condition', () => {
        assert.strictEqual(iterator.some((value) => value > 4), true);
        assert.strictEqual(iterator.some((value) => value > 10), false);
    });

    test('some() with some() should return true if any next element satisfies the condition', () => {
        assert.strictEqual(iterator.some((value) => value > 7), true);
        assert.strictEqual(iterator.some((value) => value > 7), false);
    });

    test('every() should return false if one of the elements doesn\'t satisfiy the condition', () => {
        assert.strictEqual(iterator.every((value) => value > 5), false);
    });

    test('every() with some() should return true since all elements after some() satisfiy the condition', () => {
        assert.strictEqual(iterator.some((value) => value > 5), true);
        assert.strictEqual(iterator.every((value) => value > 5), true);
    });
});

describe('Iter Skip / Take Methods', () => {
    test('skip() should skip the first 3 elements', () => {
        iterator.skip(3);
        assert.deepStrictEqual(iterator.collect(), [9, 7]);
    });

    test('skip() should return an empty array if n is greater than the length', () => {
        iterator.skip(10);
        assert.deepStrictEqual(iterator.collect(), []);
    });

    test('take() should return the first 3 elements', () => {
        iterator.take(3);
        assert.deepStrictEqual(iterator.collect(), [1, 5, 3]);
    });

    test('take() should return all elements if n is greater than the length', () => {
        iterator.take(10);
        assert.deepStrictEqual(iterator.collect(), [1, 5, 3, 9, 7]);
    });

    test('skip() followed by take() should skip the first n elements and take the next m elements', () => {
        iterator.skip(3).take(1);
        assert.deepStrictEqual(iterator.collect(), [9]);
    });

    test('take() followed by skip() should take the first n elements and then skip the next m elements', () => {
        iterator.take(3).skip(1);
        assert.deepStrictEqual(iterator.collect(), [5, 3]);
    });
});

describe('Iter Misc Methods', () => { 
    test('tap() should apply side-effect without altering elements', () => {
        iterator.tap((value) => side_effects.push(value)).collect();
        assert.deepStrictEqual(side_effects, [1, 5, 3, 9, 7]);
    });

    test('tap() should work with other methods', () => {
        iterator
            .tap((value) => side_effects.push(value))
            .map((value) => value * 2)
            .tap((value) => side_effects.push(value))
            .collect();
        assert.deepStrictEqual(side_effects, [1, 2, 5, 10, 3, 6, 9, 18, 7, 14]);
    });

});

describe('Iter Complex Functionality', () => { 
    test('Combining map(), filter(), and collect()', () => {
        iterator.map((value) => value * 2).filter((value) => value > 6);
        assert.deepStrictEqual(iterator.collect(), [10, 18, 14]);
    });

    test('Test combined functionality', () => {
        iterator.map((value) => value ** 2).filter((value) => value > 10);
        iterator.next();
        iterator.next();
        iterator.prev();
        assert.deepStrictEqual(iterator.collect(), [81, 49]);
    });

    test('Complex combined test', () => {
        iterator.map((value) => value ** 2);
        iterator.filter((value) => value % 3 === 0);
        assert.deepStrictEqual(iterator.collect(), [9, 81]);
        while (iterator.has_prev()) {
            iterator.prev();
        }
        iterator.map((value) => value * 2);
        assert.strictEqual(iterator.find((value) => value > 10), 18);
    });
});