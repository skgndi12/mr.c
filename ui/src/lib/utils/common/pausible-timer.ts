export class PausibleTimer {
  // number vs NodeJS.Timeout: https://stackoverflow.com/a/56239226/23322245
  #timerId?: ReturnType<typeof setTimeout>;
  #start: number;
  #remaining: number;
  #callback: () => void;

  constructor(callback: () => void, delay: number) {
    this.#start = Date.now();
    this.#remaining = delay;
    this.#callback = callback;

    this.resume();
  }

  resume() {
    if (this.#timerId) {
      return;
    }

    this.#start = Date.now();
    this.#timerId = setTimeout(this.#callback, this.#remaining);
  }

  pause() {
    this.clear();
    this.#remaining -= Date.now() - this.#start;
  }

  clear() {
    clearTimeout(this.#timerId);
    this.#timerId = undefined;
  }
}
