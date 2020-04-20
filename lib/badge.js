function Badge(options) {
	this.label = options.label;
	this.message   = options.message;
	this.color = options.color;
}

Badge.prototype.makeURL = function (){
	return `https://img.shields.io/static/v1?label=${this.label}&message=${this.message}&color=${this.color}`
}

module.exports = Badge;