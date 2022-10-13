import * as axios from 'axios';

declare module 'axios' {
  // 取消axios多包的一层AxiosResponse,
  // 因为已在responseInterceptor中解析了这一层

  export interface AxiosResponse<T = any> extends Promise<T> {
  }

  export interface AxiosRequestConfig {
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
}
