// webpack define plugin 注入的变量
// 放在一处，避免全量替换，导致的代码提及过分增大

declare const __DEFINE_PRECACHE_LIST: Array<string>;

const PRE_CACHE_LIST = __DEFINE_PRECACHE_LIST;

export default PRE_CACHE_LIST;
