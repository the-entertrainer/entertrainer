import EventEmitter from './EventEmitter'

export default class Time extends EventEmitter {
  start: number
  current: number
  elapsed: number
  delta: number
  private _raf: number

  constructor() {
    super()
    this.start = Date.now()
    this.current = this.start
    this.elapsed = 0
    this.delta = 16

    this._tick = this._tick.bind(this)
    this._raf = window.requestAnimationFrame(this._tick)
  }

  private _tick() {
    const currentTime = Date.now()
    this.delta = currentTime - this.current
    this.current = currentTime
    this.elapsed = this.current - this.start

    this.trigger('tick')
    this._raf = window.requestAnimationFrame(this._tick)
  }

  destroy() {
    window.cancelAnimationFrame(this._raf)
    this.off('tick')
  }
}
