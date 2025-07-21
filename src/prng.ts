export class PRNG {
  private _seed: number;
  generate: () => number;

  constructor() {
    this._seed = (Math.random() * 2 ** 32) >>> 0;
    this.generate = splitmix32(this._seed);
  }

  get seed() {
    return this._seed;
  }

  setSeed(seed: number) {
    this._seed = seed;
    this.generate = splitmix32(this._seed);
  }

  newSeed() {
    this._seed = (Math.random() * 2 ** 32) >>> 0;
    this.generate = splitmix32(this._seed);
  }
}

function splitmix32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x9e3779b9) | 0;
    let t = a ^ (a >>> 16);
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ (t >>> 15);
    t = Math.imul(t, 0x735a2d97);
    return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296;
  };
}
