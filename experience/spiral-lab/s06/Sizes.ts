import EventEmitter from './EventEmitter'

export default class Sizes extends EventEmitter {
  width: number
  height: number
  pixelRatio: number

  constructor() {
    super()
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.pixelRatio = Math.min(window.devicePixelRatio, 2)

    this._onResize = this._onResize.bind(this)
    window.addEventListener('resize', this._onResize)
  }

  private _onResize() {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.pixelRatio = Math.min(window.devicePixelRatio, 2)
    this.trigger('resize')
  }

  destroy() {
    window.removeEventListener('resize', this._onResize)
    this.off('resize')
  }
}
