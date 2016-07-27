/**
 * @module
 * @author ftheomunhoz
 * @description
 *
 */

var path = require("path"),
	express = require("express"),
	compression = require("compression");

module.exports = function (app) {
    this.createServer = function (conf) {
		conf = conf || {};
		
		var port = process.env.PORT || "9001";
		var rootPath = path.normalize(__dirname);

		var app = app || express();
		var deployMode = conf.deployMode || false;

		var deployFolder = (conf.rootFolder || "app") + (deployMode ? ("/" + (conf.deployFolder || "deploy")) : "");

		app.use(function (req, res, next) {
			if (!req.secure && process.env.NODE_ENV === "production" && req.headers["x-forwarded-proto"] !== "https") {
				return res.redirect("https://" + req.headers.host + req.url);
			}

			next();
		});

		app.use(compression());

		var completePath = path.join(path.dirname(require.main.filename), deployFolder);
		
		app.use((conf.contextRoot || ""), express.static(path.resolve(completePath)));
		
		if (conf.contextRoot !== undefined && conf.contextRoot.length > 0) {
			app.route("/").get(function (req, res) {
				res.redirect(conf.contextRoot);
			});
		}
		
		app.set("view engine", "html");
		app.set("views", completePath);

		app.listen(port, undefined, function () {
			console.log("Listening on port %d %s", port, (deployMode ? "using deploy mode" : ""));
		});

        return app;
    };

    return this;
};