class Player {
  /** @type {number} */
  x;

  /** @type {number} */
  y;

  constructor() {
    this.x = 0;
    this.y = 0;

    const span = document.createElement("span");

    span.id = "player";
    span.classList.add(
      "bg-red-500",
      "h-2",
      "w-2",
      "rounded-full",
      "absolute",
      "top-4",
      "left-4",
    );

    const board = document.getElementById("board");
    board.appendChild(span);
  }
}

class Garden {
  constructor() {
    this.id = "garden_" + Date.now().toString(36).substring(2, 9);
    this.tilled = false;
    this.occupied = false;

    const div = document.createElement("div");
    div.id = this.id;
    div.classList.add("bg-green-500");

    const board = document.getElementById("board");
    board.appendChild(div);
  }

  till() {
    if (this.tilled) {
      console.error("Already tilled!");
      return;
    }
    this.tilled = true;

    const garden = document.getElementById(this.id);
    garden.classList.remove("bg-green-500");
    garden.classList.add("bg-brown-500");
  }
}

class Board {
  constructor() {
    this.width = 1;
    this.height = 1;
    this.gardens = [];
    this.occupied_garden = null;
    this.player = null;

    const board = document.createElement("div");

    board.id = "board";
    board.classList.add("grid", "grid-board", "gap-2", "relative");

    const body = document.getElementById("body");
    body.appendChild(board);

    for (let i = 0; i < this.width * this.height; i++) {
      this.gardens.push(new Garden());
    }
  }

  set_size(width, height) {
    this.width = width;
    this.height = height;
    document.documentElement.style.setProperty("--board-width", width);
    document.documentElement.style.setProperty("--board-height", height);
  }

  increase() {
    this.width += 1;
    this.height += 1;
    document.documentElement.style.setProperty("--board-width", this.width);
    document.documentElement.style.setProperty("--board-height", this.height);
  }

  add_garden(garden) {
    if (this.gardens.length >= this.width * this.height - 1) {
      console.error("Board is full!");
      return;
    }
    if (this.occupied_garden) {
      this.gardens.push(garden);
      return;
    }

    this.occupied_garden = garden;
  }

  spawn_player(player) {
    if (this.player) {
      console.error("Player already exists!");
      return;
    }
    this.player = player;
  }

  // TODO:
  move_east() {
    for (let i = 0; i < this.gardens.length; i++) {
      if (this.gardens[i].occupied) {
        this.gardens[i].unoccupy();
        this.gardens[i + 1].occupy();
        break;
      }
    }
    const player = document.getElementById("player");
    player.classList.remove("left-4");
    player.classList.add("left-8");
  }

  till() {
    if (!this.occupied_garden) {
      console.error("No garden to be tilled!");
      return;
    }
    this.occupied_garden.till();
  }
}

/**
 * Represents an iterator object.
 */
class Iter {
  /**
   * Creates an Iterator object.
   * @param {Array} val - The array to iterate over.
   */
  constructor(val) {
    /** @type {number} Current index of the iterator */
    this.idx = 0;
    /** @type {Array} The array to iterate over */
    this.val = val;
    /** @type {Array} Array of higher order functions to be applied on the values */
    this.higherOrder = [];
    /** @type {Array} Array of callback functions */
    this.callback = [];
  }

  /**
   * Checks if there are more elements in the array to iterate over.
   * @returns {boolean} True if there are more elements, false otherwise.
   */
  hasNext() {
    return this.idx < this.val.length;
  }

  /**
   * Retrieves the next element from the array.
   * @returns {*} The next element in the array.
   */
  next() {
    return this.val[this.idx++];
  }

  /**
   * Adds a map function to be applied to the array.
   * @param {Function} fn - The map function to add.
   * @returns {Iter} - The Iterator object.
   */
  map(fn) {
    this.higherOrder.push(this._map);
    this.callback.push(fn);
    return this;
  }

  /**
   * Maps a function over the array.
   * @param {Function} fn - The function to map.
   * @param {*} val - The value to apply the function to.
   * @private
   */
  _map(fn, val) {
    // console.log(val);
    // console.log(fn);
    return fn(val);
  }

  /**
   * Adds a filter function to be applied to the array.
   * @param {Function} fn - The filter function to add.
   * @returns {Iter} - The Iterator object.
   */
  filter(fn) {
    this.higherOrder.push(this._filter);
    this.callback.push(fn);
    return this;
  }

  /**
   * Filters the array based on the provided filter function.
   * @param {Function} fn - The filter function.
   * @param {*} val - The value to filter.
   * @private
   */
  _filter(fn, val) {
    // console.log(val);
    // console.log(fn);
    return fn(val) ? val : undefined;
  }

  /**
   * Collects the modified elements from the iterator.
   * @returns {Array} - The collected elements.
   */
  collect() {
    let full_boxed = [];
    while (this.hasNext()) {
      let boxed = this.next();
      for (let i = 0; i < this.higherOrder.length && boxed !== undefined; i++) {
        boxed = this.higherOrder[i](this.callback[i], boxed);
      }
      boxed !== undefined && full_boxed.push(boxed);
    }
    return full_boxed;
  }
}

const items = [1, 2, 8];
const iterator = new Iter(items);
console.log(
  "Result: ",
  iterator
    .map((val) => val + 1)
    .filter((val) => val === 3)
    .map((val) => val + 2)
    .collect(),
);
