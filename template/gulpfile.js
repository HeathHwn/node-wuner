const bs = require('browser-sync').create() // https://browsersync.io/docs/gulp
const path = require('path')

const { src, dest, series, parallel, watch } = require('gulp')
const loadPlugins = require('gulp-load-plugins')
const plugins = loadPlugins()

const cwd = process.cwd()

const config = {
    // 默认配置
    build: {
        src: 'src',
        temp: 'temp',
        dist: 'dist',
        static: 'static',
        paths: {
            styles: 'assets/css/*.<%=cssPreprocessors%>',
            fonts: 'assets/fonts/**',
            images: 'assets/images/**',
            pages: '*.html',
            scripts: 'assets/scripts/*.js',
        }
    }
}

try {
    const loadConfig = require(path.join(cwd, 'pages.config.js'))
    Object.assign(config, loadConfig)
} catch (e) {
    // 当没有加载到pages.config.js时，这里可以处理
}

const del = require('del')

const style = () => {
    return src(config.build.paths.styles, { base: config.build.src, cwd: config.build.src })
        <% if(cssPreprocessors==='scss'){ %>.pipe(plugins.sass({ outputStyle: 'expanded' }))<%
        }else if(cssPreprocessors==='less') { %>.pipe(plugins.less())<%
        }%>
        <% if(deviceType==='Mobile'){%>.pipe(plugins.px2rem())<%}%>
        .pipe(dest(config.build.temp))
}

const script = () => {
    return src(config.build.paths.scripts, { base: config.build.src, cwd: config.build.src })
        .pipe(plugins.babel({ presets: [require('@babel/preset-env')] }))
        .pipe(dest(config.build.temp))
}

const page = () => {
    return src(config.build.paths.pages, { base: config.build.src, cwd: config.build.src })
        .pipe(plugins.swig({ data: config.data, defaults: { cache: false } }))
        .pipe(dest(config.build.temp))
}

const image = () => {
    return src(config.build.paths.images, { base: config.build.src, cwd: config.build.src })
        .pipe(plugins.imagemin())
        .pipe(dest(config.build.dist))
}

const font = () => {
    return src(config.build.paths.fonts, { base: config.build.src, cwd: config.build.src })
        .pipe(plugins.imagemin())
        .pipe(dest(config.build.dist))
}

const extra = () => {
    return src('**', { base: config.build.static, cwd: config.build.static })
        .pipe(dest(config.build.dist))
}

const clean = () => {
    return del([config.build.dist, config.build.temp])
}

const serve = () => {
    watch(config.build.paths.styles, { cwd: config.build.src }, style)
    watch(config.build.paths.scripts, { cwd: config.build.src }, script)
    watch(config.build.paths.pages, { cwd: config.build.src }, page)
    watch([
        path.join(config.build.src, config.build.paths.images),
        path.join(config.build.src, config.build.paths.fonts),
        path.join(config.build.static, '**'),
    ], bs.reload)

    bs.init({
        notify: false,
        open: false,
        files: [config.build.dist, config.build.src, config.build.static],
        server: {
            baseDir: [config.build.temp, config.build.src, config.build.static],
            routes: { '/node_modules': 'node_modules' }
        }
    });
}

const useref = () => {
    return src(config.build.paths.pages, { base: config.build.temp, cwd: config.build.temp })
        .pipe(plugins.useref({ searchPath: [config.build.temp, '.'] }))
        // html js css三种流
        .pipe(plugins.if(/\.js$/, plugins.uglify()))
        .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
        .pipe(plugins.if(/\.html$/, plugins.htmlmin({ conservativeCollapse: true, collapseWhitespace: true, minifyCSS: true, minifyJS: true })))
        .pipe(dest(config.build.dist))
}

const compile = parallel(style, script, page)

const build = series(clean, parallel(series(compile, useref), image, font, extra))

const dev = series(clean, compile, serve)

module.exports = {
    build,
    dev,
    clean,
}
