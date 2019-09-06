# HTTP
## 概念
`HTTP`(`HyperText Transport Protocol`)超文本传输协议，是位于`OSI`模型顶层的应用层，并直接与用户进行交互的一种协议。在该协议中规范了浏览器与服务器通信的语法规范，其报文结构如下:  
1. 请求报文
* 请求行：协议版本、请求方法
* 请求头：客户端想要告诉服务端的一些其他信息
* 请求体：客户端发给服务端的数据正文

2. 响应报文
* 状态行：协议版本号、状态码
* 响应头：与请求头相反
* 响应体：与请求体相反

## 请求头整理
<table>
<tr>
    <td rowspan="5">
      基本请求头
    </td>
</tr>
<tr>
    <td>accept</td>
    <td>浏览器可以接受的数据类型，比如text/html、text/plain等</td>
</tr>
<tr>
    <td>accept-launguage</td>
    <td>浏览器接收的语言类型，比如zh en</td>
</tr>
<tr>
    <td>content-type</td>
    <td>请求体MIME类型，比如application/url-encode、multi/form-data</td>
</tr>
<tr>
    <td>user-agent</td>
    <td>对客户端的一个简要描述，包括操作系统、浏览器版本等信息</td>
</tr>
<tr>
    <td rowspan="5">
     缓存相关请求头
    </td>
</tr>
<tr>
    <td>expires</td>
    <td>强缓存请求头,取值为一个具体时间点
    </td>
</tr>
<tr>
    <td>cache-control</td>
    <td>强缓存请求头，如果都取时间，优先级高于expires<br/>
        no-cache：不使用强缓存，直接进入协商缓存<br/>
        no-store：不使用缓存，每次直接向服务器发起请求<br/>
        max-age： 缓存过期时间，是一个相对时间
    </td>
</tr>
<tr>
    <td>If-Modified-Since</td>
    <td>协商缓存请求头<br/>
      与服务器端最新的更改时间进行比较，如果有更新，则直接返回数据
    </td>
</tr>
<tr>
    <td>If-Matched-None</td>
    <td>协商缓存请求头<br/>
      将数据使用MD5等算法生成摘要信息，与服务端数据进行比较，精度比If-Modified-Since更高，因此优先级也会更高
    </td>
</tr>
<tr>
    <td rowspan="4">
     跨域相关请求头
    </td>
</tr>
<tr>
    <td>Origin</td>
    <td>
      携带客户端来源信息请求头，一般格式为(协议+域名+端口)
    </td>
</tr>
<tr>
    <td>Access-Control-Request-Method</td>
    <td>
      用于CORS复杂请求中的预检请求中，告诉服务端浏览器会用到哪些请求方法
    </td>
</tr>
<tr>
    <td>Access-Control-Request-Headers</td>
    <td>
      用于CORS复杂请求中的预检请求中，告诉服务端浏览器请求头中会携带哪些额外信息
    </td>
</tr>
</table>

## GET与POST请求的区别
从**表象**来看:
* `GET` 请求回退是无害的，而 `POST` 请求回退时会再次想服务器提交数据
* `GET` 所能携带的信息有限，且一般通过 `URL` 参数的形式，而 `POST` 可以通过请求体携带更多的信息

但**实质**上是：两者在 `TCP` 协议中的传输方式不同
* `GET` 只产生一个 `TCP` 数据包，即浏览器会将 `http header` 和 `data` 一次性发出
* `POST` 会生成两个 `TCP` 数据包，浏览器首先会发送 `http header`,服务端响应 `100 continue` 之后，再将 `data` 发送过去
