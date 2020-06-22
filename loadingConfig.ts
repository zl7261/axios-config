/** *
 * request默认配置
 */
import { AxiosRequestConfig } from 'axios'

import { Loading } from 'gleaf'
import { $t } from '@/i18n'
import { ElLoadingComponent } from 'gleaf/types/loading'
import { MessageType } from 'gleaf/types/message'

let loadingInstance: ElLoadingComponent | null = null

export interface RequestConfig extends AxiosRequestConfig {
  /**
   * 是否隐藏请求加载动画 true是 false否
   */
  hideLoading?: boolean
  /**
   * 加载文本 默认 $t('common.loading')
   */
  loadingText?: string
  /**
   * 错误提示类型
   */
  warnType?: MessageType
  /**
   * 隐藏错误提示
   */
  hideWarn?: boolean
}

export const DEFAULT_CONFIG: RequestConfig = {
  hideLoading: false,
  loadingText: <string>$t('common.loading'),
  warnType: 'warning',
  hideWarn: false
}

// 需要显示加载中的数量
let needLoadingRequestCount = 0

export function startLoading(config: RequestConfig) {
  if (needLoadingRequestCount === 0 && loadingInstance === null) {
    loadingInstance = Loading.service({
      lock: true,
      text: config.loadingText,
      background: 'rgba(255, 255, 255, 0.5)',
      target: '#app-loading'
    })
  }
  needLoadingRequestCount++
}

/** *
 * 隐藏加载中提示
 */
export function endLoading() {
  if (needLoadingRequestCount <= 0) {
    return
  }
  needLoadingRequestCount--
  if (needLoadingRequestCount === 0) {
    // !debounce(func, [wait=0], [options={}]) 从上一次被调用后，延迟 wait 毫秒后调用 func 方法
    if (loadingInstance) {
      loadingInstance.close()
    }
    loadingInstance = null
  }
}
