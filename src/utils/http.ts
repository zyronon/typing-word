import axios, {AxiosInstance} from 'axios'
// import globalMethods from './global-methods'
// import Config from '../config/index'
// import CONSTANT from './const_var'
// import store from '../store'
// import Storage from './storage'

export const axiosInstance: AxiosInstance = axios.create({
  // baseURL: process.env.NODE_ENV === 'production' ? Config.PRODUCT_API_URL : Config.API_URL,
  // baseURL: 'http://testtestgp.com',
  timeout: 15000,
})

// request 拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // console.log('config', config)
    if (config.url === 'https://api.fanyi.baidu.com/api/trans/vip/translate') {
      config.url = '/baidu'
    }
    return config
  },
  error => Promise.reject(error),
)

// respone 拦截器
// instance.interceptors.response.use(
//   // 响应正常的处理
//   (response) => {
//     // console.log(response)
//     // console.log(response.data)
//     const { data } = response
//     if (response.status !== 200) {
//       globalMethods.$warning(response.statusText)
//       return Promise.reject(data)
//     }
//     if (data === null) {
//       return Promise.resolve({
//         code: '009900',
//         msg: '系统出现错误',
//         data: {},
//       })
//     }
//     return Promise.resolve(data)
//   },
//   // 请求出错的处理
//   (error) => {
//     console.log(error)
//     if (error.response === undefined && error.status === undefined) {
//       return Promise.resolve({
//         code: '009900',
//         msg: '服务器响应超时',
//         data: null,
//       })
//     }
//     if (error.response.status >= 500) {
//       return Promise.resolve({
//         code: '009900',
//         msg: '服务器出现错误',
//         data: null,
//       })
//     }
//     if (error.response.status === 401) {
//       return Promise.resolve({
//         code: '009900',
//         msg: '用户名或密码不正确',
//         data: null,
//       })
//     }
//     const { data } = error.response
//     if (data.code !== undefined) {
//       return Promise.resolve({
//         code: data.code,
//         msg: data.msg,
//       })
//     }
//     return Promise.resolve({
//       code: '009900',
//       msg: data.msg,
//       data: null,
//     })
//   },
// )


/**
 * @apiDescription 封装的网络请求方法
 * @apiGroup
 * @apiName request
 * @apiParam  url 地址
 * @apiParam  data 请求数据
 * @apiParam  params 请求参数
 * @apiParam  method 方法类型：get或者post
 * @apiParam  version 接口版本号
 * @apiParamExample
 *       request('Appointment/appointmentList', data, params, CONSTANT.GET)
 * @apiReturn Promise
 */
// async function request(url, data = {}, params = {}, method = CONSTANT.POST, version = Config.API_VERSION) {
//   // console.log(url)
//   if (method === CONSTANT.POST) {
//     data.userId = store.state.user.userInfo === null ? '' : store.state.user.userInfo.id
//   } else {
//     params.userId = store.state.user.userInfo === null ? '' : store.state.user.userInfo.id
//   }
//   return instance({
//     url: version + url,
//     method,
//     data,
//     params,
//   })
// }

// export default request