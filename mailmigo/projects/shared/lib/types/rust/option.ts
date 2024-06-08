interface OptionType {
  isSome: () => boolean;
  isNone: () => boolean;
}

export class None implements OptionType {
  isSome() {
    return false;
  }
  isNone() {
    return true;
  }
}
export class Some<T> implements OptionType {
  private value: T;

  constructor(value: T) {
    this.value = value;
  }

  get() {
    return this.value;
  }

  isSome() {
    return true;
  }
  isNone() {
    return false;
  }
}

export class Option<T> {
  private value: Some<T> | None = new None();

  private constructor(value: T | undefined) {
    if (value !== undefined) this.value = new Some(value);
  }

  public static Some<S>(value: S) {
    return new Option<S>(value);
  }

  public static None<T>() {
    const n = new Option<T>(undefined);
    return n;
  }

  isSome(): boolean {
    return this.value.isSome();
  }

  isNone(): boolean {
    return this.value.isNone();
  }

  unwrap(): T {
    if (this.value instanceof None) throw Error('Tried to unwrap Option.None');
    return this.value.get();
  }
}
