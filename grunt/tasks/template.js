module.exports = function (grunt) {

    var fs             = require('fs'),
        url            = require('url'),
        template       = require('lodash.template'),
        pkg            = require(process.cwd() + '/package.json'),
        ngMocksInclude = '<script src="node_modules/angular-mocks/angular-mocks.js"></script>',
        jsonEditorCode = fs.readFileSync(process.cwd() + '/grunt/template/jsonEditor.html', 'utf8');

    function injectIntoHtml(html, searchStr, content) {
        var pos = html.indexOf(searchStr);
        return html.substr(0, pos) + content + html.substr(pos);
    }

    function compile (src, dest, configLocation, injectNgMocks) {

        var config   = require(process.cwd() + '/' + configLocation),
            baseUrl  = grunt.option('url') || '/',
            urlParts = url.parse(baseUrl),
            html, compiler;

        config.version    = pkg.version;

        config.pwa = grunt.option('pwa');

        html = fs.readFileSync(src).toString();

        if (injectNgMocks) {
            html = injectIntoHtml(
                html,
                '<!-- build:js({.tmp,app}) scripts/scripts.js -->',
                ngMocksInclude + '\n\n' + '<script>window.name = "NG_DEFER_BOOTSTRAP!" + window.name;</script>' + '\n\n'
            );
        }

        if (grunt.option('jsoneditor')) {
            html = injectIntoHtml(
                html,
                '</body>',
                '\n' + jsonEditorCode + '\n'
            );
        }

        compiler = template(html);

        config.path = urlParts.path;
        config.url  = baseUrl;

        if (config.path.slice(-1) !== '/') {
            config.path += '/';
        }

        if (config.url.slice(-1) !== '/') {
            config.url += '/';
        }

        fs.writeFileSync(dest, compiler(config));
    }

    // process.cwd() + '/dist/config.json'

    grunt.registerTask('template:server', function () {
        compile('./app/index.html', './.tmp/index.html', './app/config.json');
    });

    grunt.registerTask('template:serverE2E', function () {
        compile('./app/index.html', './.tmp/index.html', './app/config.json', true);
    });

    grunt.registerTask('template:dist', function () {
        var dist = grunt.config.get('config.dist');
        compile(dist + '/index.html', dist + '/index.html', dist + '/config.json');
    });
};
