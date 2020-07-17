#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const ejs = require('ejs')
const inquirer = require('inquirer')
const spawn = require("child_process").spawn;

inquirer.prompt([
    {
        type: 'input',
        name: 'projectName',
        message: 'project name:',
        default: 'my-project'
    },
    {
        type: 'input',
        name: 'description',
        message: 'project description:'
    },
    {
        type: 'input',
        name: 'author',
        message: 'author:'
    },
    {
        type: 'rawlist',
        name: 'license',
        choices: ['ISC', 'MIT'],
        message: 'license:'
    },
    {
        type: 'rawlist',
        name: 'deviceType',
        choices: ['PC', 'Mobile'],
        message: 'Types of devices:'
    },
    {
        type: 'rawlist',
        name: 'cssPreprocessors',
        choices: ['less', 'scss', 'css'],
        message: 'CSS Preprocessors:'
    },
    {
        type: 'rawlist',
        name: 'autoInstall',
        choices: [{ name: 'use Npm', value: 'npm' }, { name: 'use Yarn', value: 'yarn' }, { name: 'No, I will handle that myself', value: 'no' }],
        message: 'Should we run `npm install` or `yarn` for you after the project has been created ?'
    },
]).then(answers => {
    // 模板目录
    const templateDir = path.join(__dirname, 'template')
    // 目标目录
    const destDir = path.join(process.cwd(), answers.projectName)
    // 判断项目是否已存在，存在则抛出异常
    if(fs.existsSync(destDir)){
        throw Error('Project already exists')
    }
    // 创建文件夹
    fs.mkdir(destDir, { recursive: true }, (err) => {
        if (err) throw err
        // 将模板下的文件全部转到目标目录
        readFile(templateDir, destDir, answers)
    });
    // 根据用户选择的命令，执行对应的命令脚本
    switch (answers.autoInstall) {
        case 'npm':
            runCmd(process.platform === "win32" ? "npm.cmd" : "npm", ['install'], destDir)
            break
        case 'yarn':
            runCmd(process.platform === "win32" ? "yarn.cmd" : "yarn", [], destDir)
            break
        case 'no':
            console.log('Successful project initialization')
            break

    }
})

const readFile = (srcPath, destDir, answers) => {
    fs.readdir(srcPath, (err, files) => {
        // 抛出异常
        if (err) throw err
        // 遍历文件
        files.forEach(file => {
            //拼接路径
            const fPath = path.join(srcPath, file);
            fs.stat(fPath, (err, stat) => {
                //stat 状态中有两个函数一个是stat中有isFile ,isisDirectory等函数进行判断是文件还是文件夹
                if (stat.isFile()) {
                    if (destDir.includes('images')) {
                        // 读取文件流
                        const readStreame = fs.createReadStream(fPath);
                        // 写入文件流
                        const writeStreame = fs.createWriteStream(path.join(destDir, file));
                        // 把读取出来的文件流导入写入文件流
                        readStreame
                            .pipe(writeStreame) // 写入
                    } else {
                        // 通过模板引擎渲染文件
                        ejs.renderFile(fPath, answers, (err, result) => {
                            // 将结果写入目标目录
                            if (err) throw err
                            // 判断是否是css文件夹，写入对应的样式文件
                            if (destDir.includes('css')) {
                                if (path.extname(file) === `.${answers.cssPreprocessors}`) {
                                    fs.writeFileSync(path.join(destDir, file), result)
                                }
                            } else {
                                fs.writeFileSync(path.join(destDir, file), result)
                            }
                        })
                    }
                }
                else {
                    // 拼接目标路径
                    const dDir = path.join(destDir, file)
                    // 创建目标文件夹
                    fs.mkdir(dDir, { recursive: true }, (err) => {
                        if (err) throw err
                        // 自调用
                        readFile(fPath, dDir, answers)
                    });
                }
            })

        })
    })
}
// 使用child_process（子进程），执行cmd命令
const runCmd = (command, args, destDir) => {
    spawn(command, args, { stdio: 'inherit', cwd: destDir }, (error, stdout, stderr) => {
        if (error) {
            console.error(error);
        }
        else {
            console.log("Successful project initialization");
        }
    });
}
