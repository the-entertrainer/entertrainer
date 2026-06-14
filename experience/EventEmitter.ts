export default class EventEmitter {
  private _callbacks: Record<string, Function[]> = {}

  on(name: string, cb: Function) {
    ;(this._callbacks[name] ??= []).push(cb)
    return this
  }

  off(name: string, cb?: Function) {
    if (!cb) delete this._callbacks[name]
    else this._callbacks[name] = (this._callbacks[name] ?? []).filter((f) => f !== cb)
    return this
  }

  trigger(name: string, args: any[] = []) {
    this._callbacks[name]?.forEach((cb) => cb(...args))
  }
}
