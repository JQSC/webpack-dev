
const  { getOptions }=require('loader-utils')


module.exports=function (source) {
    const options = getOptions(this);

    console.log('source',source)
    // 对资源应用一些转换……

    return source;
}
