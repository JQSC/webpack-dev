//支持按目录导入
//例子: import a from './**/index'
const path = require('path');
const fs = require('fs');
const SPEC = '**';

function isDirectory(dir) {
    try {
        let stat = fs.statSync(dir);
        return stat.isDirectory()
    } catch (e) {
        return null;
    }
}

function readdir(dir) {
    if (!isDirectory(dir)) return;
    return fs.readdirSync(dir);
}

function createImportDeclaration(t, n, p) {
    const importDefaultSpecifier = [t.ImportDefaultSpecifier(t.Identifier(n))];
    return t.ImportDeclaration(importDefaultSpecifier, t.StringLiteral(p));
}

function createVariableDeclaration(t, n, p) {
    return t.variableDeclaration(
        n,
        [
            t.variableDeclarator(
                t.identifier(p)
            ),
        ]
    )
}

function isImports(value) {
    return value.indexOf(SPEC) > -1
}
//第一个参数为babel对象
module.exports = function ({ types: t }, opts = {}) {
    return {
        visitor: {
            /*
            p:import语法相关属性
            state: 当前文件相关属性
            */
            ImportDeclaration(p, state) {
                //import是否包含**式引用
                const { source, specifiers } = p.node;
                if (!isImports(source.value)) return;

                // 如果是空导入则直接删除掉
                if (specifiers.length === 0) {
                    p.remove()
                    return
                }

                // 判断是否是默认导入
                if (!specifiers.every(i => t.isImportDefaultSpecifier(i))) {
                    // 抛出错误，Babel会展示出错的代码帧
                    throw p.buildCodeFrameError("只能使用默认导入!")
                }

                const localName = specifiers[0].local.name;
                //import是相对路径引用，所以需要根据当前文件路径获取引入的绝对路径
                const filename = state.file.opts.filename;
                //当前解析的js文件目录
                const filePath = path.dirname(filename);
                //引入文件的目录
                const importDir = source.value.split('/' + SPEC)[0];
                const importFileName = source.value.split('/' + SPEC)[1];
                const dirname = path.join(filePath, importDir);

                //同步读取目录,返回文件名数组
                let fileDirNames = readdir(dirname);
                fileDirNames = fileDirNames.filter((fileName) => {
                    //剔除非目录
                    let fileDir = path.join(dirname, fileName);
                    if (!isDirectory(fileDir)) return
                    //替换**为真实目录名,获取文件绝对路径
                    let newFileName = path.join(fileDir, importFileName);
                    try {
                        let isExist = fs.statSync(newFileName);
                        return isExist
                    } catch (e) {
                        return null
                    }
                })
                //根据目录中存在的文件数量生成多个import
                for (let i = 0; i < fileDirNames.length; i++) {
                    let fileDirName = fileDirNames[i];
                    let variableName = fileDirName;
                    //判断目录名与导出名重复情况
                    if (variableName === localName) {
                        variableName += 1
                        fileDirNames[i] = variableName;
                    }
                    //目录名做标识符
                    const importDeclaration = createImportDeclaration(t, variableName, source.value.replace(SPEC, fileDirName));
                    p.insertBefore(importDeclaration);
                }

                //创建所有对象的引用
                const variableDeclaration = createVariableDeclaration(t, 'const', `${localName}={${fileDirNames.join(',')}}`)
                p.insertAfter(variableDeclaration)
                //移除自身import引入
                p.remove();
            }
        }
    };
}
