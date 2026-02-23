/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export abstract class ESQLBase {
  protected _parent: ESQLBase | null = null

  protected setParent(parent: ESQLBase): this {
    this._parent = parent
    return this
  }

  render(): string {
    const parentStr = this._parent ? `${this._parent.render()}\n| ` : ''
    return parentStr + this._renderInternal()
  }

  protected abstract _renderInternal(): string

  toString(): string {
    return this.render()
  }

  toJSON(): { query: string } {
    return { query: this.render() }
  }
}
