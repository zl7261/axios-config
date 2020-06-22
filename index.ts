/** *
 * author:1494
 * date:20190213
 * 使用：
 * import api from "@/api";
 * api.module.function_module.function(url,request_data,request_config)
 *  http请求方法 url
 *  @param url: string 请求链接
 *  @param data: 请求参数 请求链接  注意：{data}
 *  @param config: 配置参数
 */

import axios, { AxiosError } from 'axios'
import _, { throttle } from 'lodash'
import { getToken, removeToken } from '@/utils/cookie'
import { copy, jsonToUrlParams } from '@/utils/tools'
import { Message, Notification } from 'gleaf'
import { $t } from '@/i18n'
import { DEFAULT_CONFIG, endLoading, RequestConfig, startLoading } from '@/api/loadingConfig'
import { ElMessageOptions } from 'gleaf/types/message'
import { ACTIVE_CANCEL } from '@/utils/constant/uploadCancel'
import { notification } from '@/utils/message'

// 请求接口参数前缀
const BASE_PREFIX = '/'

export const BASE_URL = '/api/'

/** *
 * !创建axios实例 https://github.com/axios/axios
 */
const service = axios.create({
  // !Request Config
  baseURL: BASE_PREFIX, // !`baseURL` will be prepended to `url` unless `url` is absolute. eg: get("/user")
  timeout: 1000 * 60 * 30 // !If the request takes longer than `timeout`, the request will be aborted.
})

/** *
 * Request 拦截器
 */
service.interceptors.request.use((requestConfig: RequestConfig) => {
  let url = requestConfig.url

  if (!url) {
    throw new Error('url is empty')
  }
  requestConfig.headers['token'] = getToken() // !axios请求头设置参数token验证权限
  if (!url.startsWith(BASE_PREFIX)) {
    requestConfig.url = BASE_URL + requestConfig.url // !absolute url: `baseURL` should be prepended to `url` manually  eg: get("user")
  }
  if (!requestConfig.hideLoading) { // !自定义请求配置: 是否隐藏加载中， 默认false(详见DEFAULT_CONFIG)
    startLoading(requestConfig)
  }
  return requestConfig
}, (err) => {
  return Promise.reject(err)
})

const handleResponse = (responseConfig: any) => {
  let config = <RequestConfig>responseConfig.config // !the config that was provided to `axios` for the request

  if (!config.hideLoading) { // !如果请求配置中带了hideLoading：false开始了一个loading, 那么在响应中结束loading
    endLoading()
  }
  /*
    !error response demo
    data: null
    error: {errorCode: 400, msg: "server.param.validate._.must.not.be.empty-[server.taskName]"}
    ret: -1
  */
  let responseData = responseConfig.data

  if (!config.hideWarn && responseData.ret < 0) {
    let {'error': {msg, fieldErrors, errorCode}, data} = responseData

    if (fieldErrors && fieldErrors.length) {
      msg = fieldErrors[0].msg
    }

    /* 软终端错误信息格式化 */
    let ts = data instanceof Object ? data : {} // data: null -> ts={}

    /*
     * i18n配置
     * 1. hibernate标准校验异常'{param1}的值不能为空'
     * 2. 字段： 'server.cycle': '重复周期'
     */
    if (msg.indexOf('-') > -1) {
      const arr = msg.split('-')

      if (arr.length) {
        const params =
        arr.length > 1 ? arr[1].replace(/[[\]]/g, '').split(',') : [] // !去除'[]':[server.cycle] -> server.cycle

        params.forEach((param: string, index: number) => {
          ts[`param${index + 1}`] = $t(param) // !ts = { param1: $t(server.cycle) }
          msg = arr[0] // !msg = "server.param.validate._.must.not.be.empty"
        })
      }
    }

    let messageStr = (msg === 'Internal Server Error' || !$t(msg, ts) ? $t('common.net.error') : $t(msg, ts))
    let options: ElMessageOptions = {
      type: config.warnType || 'warning',
      message: <string>messageStr
    }

    Message(options)

    if (errorCode === 401) {
      if (!msg) {
        Message.warning(String($t('登录身份失效，请重新登录')))
      }
      removeToken()
      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
    }
    if (data === 'login.auth.error.token') {
      return
    }
  }
  return responseConfig && responseData
}

const ErrorDelay = 1500
const RetryCode = [502]

/** Response 拦截器
 * 修改方法返回值需修改 @see @api/axios.d.ts
 */
service.interceptors.response.use((responseConfig: any) => {
  try {
    return handleResponse(responseConfig)
  } catch (e) {
    return
  }
}, throttle(errorResp => {
  if (!errorResp) return

  // 主动取消的请求
  if (errorResp.message === ACTIVE_CANCEL) {
    notification.cancel()
    return Promise.reject(errorResp)
  }

  if (!errorResp.hasOwnProperty('config')) {
    Notification.error({
      title: '连接失败',
      message: '连接后台服务器失败,请联系系统管理员',
      duration: ErrorDelay
    })
    return Promise.reject(errorResp)
  }

  // 处理502 econnreset 重试
  // 暂不清楚异常信息及原因

  let status = _.get(errorResp, 'response.status', '')

  if (RetryCode.includes(status)) {
    axios.request(errorResp.config).then((response: any) => {
      handleResponse(response)
    }).catch(retryError => {
      return handleResponseError(retryError)
    })
    return Promise.reject(errorResp)
  }

  return handleResponseError(errorResp)
}, ErrorDelay))

const handleResponseError = (errorResp: AxiosError) => {
  if (errorResp.config && !errorResp.config.hideLoading) {
    endLoading()
  }
  let message = '服务器错误'
  let status = _.get(errorResp, 'response.status', '')

  Notification.error({
    title: '请求失败',
    message: `${message} ${status}`,
    duration: ErrorDelay
  })
  return Promise.reject(errorResp)
}

/** *
 * http请求方法 url
 *  @param url: string 请求链接
 *  @param data: 请求参数 请求链接  注意：{data}
 *  @param config: 配置参数
 */
export default {
  'get': (url: string, data: object, config?: RequestConfig): any => {
    return service.get(url, {'params': data || {}, ...DEFAULT_CONFIG, ...config})
  },
  'post': (url: string, data: object, config?: RequestConfig): any => {
    return service.post(url, data || {}, {...copy(DEFAULT_CONFIG), ...config})
  },
  'put': (url: string, data: object, config?: RequestConfig): any => {
    // return service.put(url, data || {}, extend(copy(DEFAULT_CONFIG), config))
    return service.put(url, data || {}, {...copy(DEFAULT_CONFIG), ...config})
  },
  'delete': (url: string, data: object, config?: RequestConfig): any => {
    return service.delete(url, {...{data}, ...DEFAULT_CONFIG, ...config})
  },
  'patch': (url: string, data: object, config?: RequestConfig): any => {
    // return service.patch(url, data || {}, extend(DEFAULT_CONFIG, config))
    return service.patch(url, data || {}, {...copy(DEFAULT_CONFIG), ...config})
  },
  'download': async (url: string, data: any) => {
    const downloadUrl = `${BASE_URL}${url}?token=${getToken()}&${jsonToUrlParams(data)}`

    window.open(downloadUrl)
  }
}
