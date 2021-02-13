/*
 * CCTemplatingAPI - API for making JSON templating more useful
 * Written starting in 2019 by 20kdc
 * Merged into CCItemAPI in 2021 by dmitmel
 * To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.
 * You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
 */

// 0: Allow arbitrary resource reordering.
ig.Loader.inject({
	stagedLoaderRemainingStages: [],
	finalize: function () {
		// If there's more to do, cause more resource loads & continue.
		if (this.stagedLoaderRemainingStages.length > 0) {
			this.prevResourcesCnt = ig.resources.length;
			ig.resources.length = 0;
			clearInterval(this._intervalId);
			this.stagedLoaderRemainingStages.shift()();
			this.load();
			return;
		}
		this.parent();
	},
	init: function (gameClass) {
		if (gameClass) {
			const mainStage = ig.resources;
			ig.resources = [];
			this.stagedLoaderSetup(mainStage);
			this.parent(gameClass);
		} else {
			this.parent(gameClass);
		}
	},
	stagedLoaderSetup: function (resources) {
		this.stagedLoaderRemainingStages.push(function () {
			for (var i = 0; i < resources.length; i++)
				ig.resources.push(resources[i]);
		});
	}
});

// 1: Add missing templating.
function addTemplating(clazz, id) {
	clazz.inject({
		[id]: function (data) {
			data = ig.jsonTemplate.resolve(data);
			return this.parent.apply(this, arguments);
		}
	});
}

const onload = Object.keys({onload:1})[0];
const loadLevel = Object.keys({loadLevel:1})[0];

addTemplating(ig.Lang, onload);
addTemplating(ig.TileInfoList, onload);
addTemplating(ig.GlobalSettings, onload);
// loadExtensionsPHP left alone; not consistent
addTemplating(ig.Game, loadLevel);
addTemplating(ig.Database, onload);
addTemplating(ig.Terrain, onload);

addTemplating(sc.VerionChangeLog, onload);
addTemplating(sc.Inventory, onload);
addTemplating(sc.AreaLoadable, onload);
// Indiegogo system is dummied out
addTemplating(sc.SkillTree, onload);
// These two might not be in earlier versions, so to make future work easier...
if (sc.CreditSectionLoadable)
	addTemplating(sc.CreditSectionLoadable, onload);
if (sc.CupAsset)
	addTemplating(sc.CupAsset, onload);

// 2: Install a system for registering functions as JSON templates.
// This essentially changes the type of the templates 'array' even further.
// (For more general approaches, you might want to add your own hooks.)
ig.JsonTemplate.inject({
	extendedTemplatingPerformer: function (template, data, index, root) {
		const subTemplate = this.templates[template];
		if (subTemplate instanceof Function)
			data[index] = subTemplate(data[index], root);
	},
	extendedTemplatingIndexer: function (data, root) {
		// All important values are truthy
		if (!data)
			return;
		if (data.constructor === Array) {
			for (let i = 0; i < data.length; i++)
				this.extendedTemplatingResolver(data, i, root);
		} else if (data.constructor === Object) {
			for (let k in data)
				this.extendedTemplatingResolver(data, k, root);
		}
	},
	extendedTemplatingResolver: function (data, index, root) {
		// All important values are truthy
		if (!data[index])
			return;
		if (data[index].jsonINSTANCE !== undefined) {
			this.extendedTemplatingPerformer(data[index].jsonINSTANCE, data, index, root);
		} else {
			this.extendedTemplatingIndexer(data[index], root);
		}
	},
	resolve: function (data) {
		this.extendedTemplatingIndexer(data, data);
		return this.parent.apply(this, arguments);
	}
});
