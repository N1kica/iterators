/**
 * Represents an iterator object.
 * @template T
 */
class Iter {
    /**
     * Creates an Iterator object.
     * @param {Array<T>} val - The array to iterate over.
     */
    constructor(val) {
        /** @type {number} Current index of the iterator */
        this.idx = 0;
        /** @type {Array<T>} The array to iterate over */
        this.val = val || [];
        /** @type {Array<function(function(T): any, T): T | undefined>} Array of higher order functions to be applied on the values */
        this.higher_order = [];
        /** @type {Array<function(T): any>} Array of callback functions */
        this.callback = [];
    }
  
    /**
     * Resets the iterator to its initial state.
     * @returns {void}
     */
    reset() {
        this.idx = 0;
        this.higher_order = [];
        this.callback = [];
    }
  
    /**
     * Checks if there are next elements in the array to iterate over.
     * @returns {boolean} True if there are next elements, false otherwise.
     */
    has_next() {
        return this.idx < this.val.length;
    }
  
    /**
     * Retrieves the next element from the array.
     * @returns {T | undefined} Next element in the array, or undefined if none.
     */
    next() {
        /** @type {T | undefined} The next element to be returned, or undefined if none. */
        let next;
    
        while (this.has_next() && next === undefined) {
            next = this.val[this.idx++];
            for (let i = 0; i < this.higher_order.length && next !== undefined; i++) {
                next = this.higher_order[i](this.callback[i], next);
            }
        }
        if (this.has_next()) {
            console.assert(next !== undefined, "Iterator exhausted abruptly!");
        }
        return next;
    }
  
    /**
     * Checks if there are previous elements in the array to iterate over.
     * @returns {boolean} True if there are previous elements, false otherwise.
     */
    has_prev() {
        return this.idx > 0;
    }
  
    /**
     * Retrieves the previous element from the array.
     * @returns {T | undefined} Previous element in the array, or undefined if none.
     */
    prev() {
        /** @type {T | undefined} The previous element to be returned, or undefined if none. */
        let prev;
    
        while (this.has_prev() && prev === undefined) {
            prev = this.val[(this.idx -= 1)];
            for (let i = 0; i < this.higher_order.length && prev !== undefined; i++) {
                prev = this.higher_order[i](this.callback[i], prev);
            }
        }
        if (this.has_prev()) {
            console.assert(prev !== undefined, "Iterator exhausted abruptly!");
        }
        return prev;
    }
  
    /**
     * Peeks at the next element without advancing the iterator.
     * @returns {T | undefined} - The next element in the array, or undefined if there are no more elements.
     */
    peek() {
        return this.val[this.idx + 1];
    }
  
    /**
     * Adds a map function to be applied to the array.
     * @param {function(T): T} fn - The map function to add.
     * @returns {Iter<T>} - The Iterator object.
     */
    map(fn) {
        this.higher_order.push(this._map);
        this.callback.push(fn);
        return this;
    }
  
    /**
     * Maps a function over the array.
     * @param {function(T): T} fn - The function to map.
     * @param {T} val - The value to apply the function to.
     * @returns {T} - The mapped value.
     * @private
     */
    _map(fn, val) {
        return fn(val);
    }
  
    /**
     * Adds a filter function to be applied to the array.
     * @param {function(T): boolean} fn - The filter function to add.
     * @returns {Iter<T>} - The Iterator object.
     */
    filter(fn) {
        this.higher_order.push(this._filter);
        this.callback.push(fn);
        return this;
    }
  
    /**
     * Filters the array based on the provided filter function.
     * @param {function(T): boolean} fn - The filter function.
     * @param {T} val - The value to filter.
     * @returns {T | undefined} - The filtered value, or undefined if the value is filtered out.
     * @private
     */
    _filter(fn, val) {
        return fn(val) ? val : undefined;
    }

    /**
     * Checks if any of the elements satisfy the condition.
     * @param {function(T): boolean} fn - The some function.
     * @returns {boolean} - True if any element satisfies the condition, false otherwise.
     */
    some(fn) {
        this.higher_order.push(this._filter);
        this.callback.push(fn);
        return !!this.next();
    }

    /**
     * Finds the first element that satisfies the condition.
     * @param {function(T): boolean} fn - The find function.
     * @returns {T | undefined} - The first element that satisfies the condition, or undefined if no such element exists.
     */
    find(fn) {
        this.higher_order.push(this._filter);
        this.callback.push(fn);
        return this.next();
    }
  
    /**
     * Adds a tap function to be applied to the array.
     * @param {function(T): void} fn - The tap function to add.
     * @returns {Iter<T>} - The Iterator object.
     */
    tap(fn) {
        this.higher_order.push(this._tap);
        this.callback.push(fn);
        return this;
    }
  
    /**
     * Taps the array based on the provided tap function.
     * @param {function(T): void} fn - The tap function.
     * @param {T} val - The value to tap.
     * @returns {T}
     * @private
     */
    _tap(fn, val) {
        fn(val);
        return val;
    }
  
    /**
     * Collects the modified elements from the iterator.
     * @returns {Array<T>} - The collected elements.
     */
    collect() {
        /** @type {Array<T>} The array to collect the results. */
        let collected = [];
    
        while (this.has_next()) {
            /** @type {T | undefined} The transformed element to be collected, or undefined if none. */
            let transformed = this.next();
    
            if (transformed !== undefined) {
                collected.push(transformed);
            }
        }
        return collected;
    }
}

module.exports = {
    Iter
}