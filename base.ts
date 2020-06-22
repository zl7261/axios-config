enum Order {
  ASC = 1,
  DEFAULT = 0,
  DESC = -1
}

type Ret = 0 | 1 | -1

export class OrderBy {
  field: string
  order: Order = Order.DEFAULT

  constructor(field: string, order: Order) {
    this.field = field
    this.order = order
  }
}

export class PageReq {
  skip?: number
  limit?: number
  orderbys?: OrderBy[]

  constructor(skip: number, limit: number, orderbys: OrderBy[]) {
    this.skip = skip
    this.limit = limit
    this.orderbys = orderbys
  }
}

export class PageResponse<T> {
  data: {
    data: T[]
    orderbys: OrderBy[]
    limit: number
    skip: number
    total: number
  }
  error: {
    errorCode: number
    msg: string
  }
  ret: Ret

  constructor(data: { data: T[]; orderbys: OrderBy[]; limit: number; skip: number; total: number }, error: { errorCode: number; msg: string }, ret: 0 | 1 | -1) {
    this.data = data
    this.error = error
    this.ret = ret
  }
}

export class Response<T> {
  data: T
  error: {
    errorCode: number
    msg: string
  }
  ret: Ret

  constructor(data: T, error: { errorCode: number; msg: string }, ret: Ret) {
    this.data = data
    this.error = error
    this.ret = ret
  }
}

