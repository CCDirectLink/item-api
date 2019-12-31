/*
 * CCItemAPI - API for cross-modloader item registration & management
 * Written starting in 2019 by 20kdc
 * To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.
 * You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
 */

// This file assists mod creation with various tweaks.
const itemAPI = window.itemAPI;

// 0: Handle item database super early & register json templates after it's done starting up. (The 'register JSON templates' part is handled above.)
ig.Loader.inject({
	stagedLoaderSetup: function (resources) {
		ig.resources.splice(resources.indexOf(sc.inventory), 1);
		this.stagedLoaderRemainingStages.push(function () {
			ig.resources.push(sc.inventory);
		});
		this.parent(resources);
	}
});

// 1: PlayerSkinLibrary from Database
// NOTE: PlayerSkinLibrary is a GameAddon. This means it gets created in Game.init, which is *after* ig.Database is loaded (because it's part of the post-game-creation loading stage)
// This defines the object playerSkins in the Database (which has just been JSON-templatized)
sc.PlayerSkinLibrary.inject({
	init: function () {
		this.parent();
		var psl = ig.database.get("playerSkins");
		if (psl !== void 0)
			for (var k in psl)
				this.registerSkin(k, psl[k]);
	}
});

