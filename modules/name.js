class Name {
  constructor(value) {
    this._value = value;
    this._initialCount = 0;
    this._remainingCount = 0;
  }

  get value() {
    return this._value;
  }

  get initialCount() {
    return this._initialCount;
  }

  set initialCount(initialCount) {
    this._initialCount = initialCount;
  }

  get remainingCount() {
    return this._remainingCount;
  }

  set remainingCount(remainingCount) {
    this._remainingCount = remainingCount;
  }

  incrementCount() {
    this.remainingCount += 1;
  }

  decrementCount() {
    this.remainingCount -= 1;
  }
}

class Fullname {
  constructor(firstname, lastname) {
    this._value = `${firstname.value} ${lastname.value}`
    this._firstname = firstname,
    this._lastname = lastname,
    this._nickname = null
  }
  
  get firstname() {
    return this._firstname;
  }

  get lastname() {
    return this._lastname;
  }

  get nickname() {
    return this._nickname;
  }

  set nickname(value) {
    this._nickname = value;
  }

  hasNickname() {
    return this.nickname !== null;
  }
}

module.exports = {
  Name: Name,
  Fullname: Fullname
}