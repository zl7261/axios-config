import { AxiosAdapter, AxiosBasicCredentials, AxiosProxyConfig, AxiosTransformer, Cancel, CancelToken } from 'axios'
import { MessageType } from 'gleaf/types/message'

declare module 'axios' {
  // 取消axios多包的一层AxiosResponse,
  // 因为已在responseInterceptor中解析了这一层

  export interface AxiosResponse<T = any> extends Promise<T> {
  }

  export interface AxiosRequestConfig {
    url?: string;
    method?: string;
    baseURL?: string;
    transformRequest?: AxiosTransformer | AxiosTransformer[];
    transformResponse?: AxiosTransformer | AxiosTransformer[];
    headers?: any;
    params?: any;
    paramsSerializer?: (params: any) => string;
    data?: any;
    timeout?: number;
    withCredentials?: boolean;
    adapter?: AxiosAdapter;
    auth?: AxiosBasicCredentials;
    responseType?: string;
    xsrfCookieName?: string;
    xsrfHeaderName?: string;
    onUploadProgress?: (progressEvent: any) => void;
    onDownloadProgress?: (progressEvent: any) => void;
    maxContentLength?: number;
    validateStatus?: (status: number) => boolean;
    maxRedirects?: number;
    httpAgent?: any;
    httpsAgent?: any;
    proxy?: AxiosProxyConfig | false;
    cancelToken?: CancelToken;
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

  export interface CancelToken {
    promise: Promise<Cancel>;
    reason?: Cancel;

    throwIfRequested(): void;
  }
}
