# 脚手架

## 脚手架安装
```text
npm i node-wuner -g
```

## 脚手架使用

```text
node-wuner
```

## 用户交互

- projectName

    > 项目名称

- description

    > 项目描述

- author

    > 作者

- license

    > 许可证

- deviceType

    > 设备类型
    
    可选项
    
    - PC
    - Mobile

- cssPreprocessors

    > css 预处理
    
    可选项
    
    - less
    - scss
    - css
    
- autoInstall

    > 创建项目后，是否要执行插件安装
    
    可选项
    
    - Npm
    - Yarn
    - No, I will handle that myself

## 脚手架目录结构

```text
└───template/..........................模板目录
    ├───src/...........................src目录
    │   └───assets/...................资源目录
    │       └───css/..................样式文件目录
    │       └───fonts/................字体资源目录
    │       └───images/...............图片目录
    │       └───scripts/..............js目录
    │   └───index.html................html文件
    └───static/.......................无需编译的静态资源目录
    └───gulpfile.js...................gulp配置文件
    └───package.json..................模块包配置文件
├───.gitignore........................git忽略文件
├───cli.js............................脚手架文件
├───package.json......................模块包配置文件
```
