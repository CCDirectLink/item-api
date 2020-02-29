/*
 * CCItemAPI - API for cross-modloader item registration & management
 * Written starting in 2019 by 20kdc
 * To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.
 * You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
 */

import itemAPI from './base.js';

// Creates or accesses a shadow table.
itemAPI.shadow = function (saving, json, key, isArray) {
	var tblA = json["vars"]["storage"]["ITEMAPI_OW_THE_EDGE_" + key];
	if (tblA)
		return tblA;
	var tblB = isArray ? [] : {};
	json["vars"]["storage"]["ITEMAPI_OW_THE_EDGE_" + key] = tblB;
	return tblB;
};

itemAPI.processHelperObjectKeys = function (saving, json, key, victim, prefix, postfix) {
	var shadow = itemAPI.shadow(saving, json, key, false);
	if (saving) {
		for (var kx in victim) {
			if (!kx.startsWith(prefix))
				continue;
			if (!kx.endsWith(postfix))
				continue;
			var k = kx.substring(prefix.length);
			k = k.substring(0, kx.length - postfix.length);
			if (k in itemAPI.idToCustomItem) {
				var name = itemAPI.idToCustomItem[k];
				if (itemAPI.idToCustomItem[k] in shadow) {
					alert("CRITICAL ITEM DAMAGE ALERT, PLEASE CHECK DEV TOOLS...");
					console.log("So apparently the custom item name " + name + " (id# " + k + ") didn't exist before, or it'd have been deleted, but now it does. Wtf?");
				}
				shadow[name] = victim[kx];
				delete victim[kx];
			}
		}
	} else if (shadow) {
		for (var k in shadow) {
			if (k in itemAPI.customItemToId) {
				victim[itemAPI.customItemToId[k] + postfix] = shadow[k];
				delete shadow[k];
			}
		}
	}
};

itemAPI.processHelperArrayValues = function (saving, json, key, victim) {
	var shadow = itemAPI.shadow(saving, json, key, true);
	if (saving) {
		for (var i = 0; i < victim.length; i++) {
			if (victim[i] in itemAPI.idToCustomItem) {
				shadow.push(itemAPI.idToCustomItem[victim[i]]);
				victim.splice(i, 1);
				i--;
			}
		}
	} else if (shadow) {
		for (var i = 0; i < shadow.length; i++) {
			if (shadow[i] in itemAPI.customItemToId) {
				victim.push(itemAPI.customItemToId[shadow[i]]);
				shadow.splice(i, 1);
				i--;
			}
		}
	}
};

itemAPI.storageProcessors = {
	// NOTE: EVERY TIME CC VERSIONS, CHECK ALL onStorageSave callbacks & related!
	statsModelItems: function (saving, json) {
		// Item counts: object, maps item IDs to their counts.
		itemAPI.processHelperObjectKeys(saving, json, "statsModelItems", json["stats"]["items"], "", "");
		itemAPI.processHelperObjectKeys(saving, json, "statsModelItemsUse", json["stats"]["items"], "used-", "");
	},
	playerModelItems: function (saving, json) {
		// Items are stored in an array, but that array can contain undefined all over the place, and that can then become null.
		// It's thus perfectly safe for an undefined item to have a count of null in the real array.
		// The shadow version is an OBJECT, not an array
		var shadow = itemAPI.shadow(saving, json, "playerModelItems", false);
		if (saving) {
			for (var k in itemAPI.idToCustomItem) {
				var name = itemAPI.idToCustomItem[k];
				if (name in shadow) {
					alert("ITEM " + name + " WAS REGISTERED LATE, OR THERE'S A BUG. YOU SHOULD NEVER EVER EVER SEE THIS. (Like, ever.)");
					// NOT GOOD. OTHER STUFF IS STILL BROKEN. But at least try to keep gained items in the savefile.
					shadow[name] = shadow[name] || 0;
					shadow[name] += json["player"]["items"][k] || 0;
				} else {
					shadow[name] = json["player"]["items"][k];
				}
				json["player"]["items"][k] = null;
			}
		} else if (shadow) {
			for (var k in shadow) {
				if (k in itemAPI.customItemToId) {
					json["player"]["items"][itemAPI.customItemToId[k]] = shadow[k];
					delete shadow[k];
				}
			}
		}
	},
	playerModelItemFavs: function (saving, json) {
		itemAPI.processHelperArrayValues(saving, json, "playerModelItemFavs", json["player"]["itemFavs"]);
	},
	playerModelItemNew: function (saving, json) {
		itemAPI.processHelperArrayValues(saving, json, "playerModelItemNew", json["player"]["itemNew"]);
	},
	playerModelItemToggles: function (saving, json) {
		itemAPI.processHelperObjectKeys(saving, json, "playerModelItemToggles", json["player"]["itemToggles"], "", "");
	},
	playerModelEquip: function (saving, json) {
		var shadow = itemAPI.shadow(saving, json, "playerModelEquip", false);
		// Equipped items are taken out of the main inventory. This means some shenanigans have to be pulled.
		// If a player is equipping a custom item, goes into vanilla, equips a regular item, then comes back, we are SOOOO screwed.
		var victim = json["player"]["equip"];
		if (saving) {
			for (var k in victim) {
				if (victim[k] in itemAPI.idToCustomItem) {
					shadow[k] = itemAPI.idToCustomItem[victim[k]];
					victim[k] = -1;
				}
			}
		} else if (shadow) {
			for (var k in shadow) {
				if (shadow[k] in itemAPI.customItemToId) {
					var id = itemAPI.customItemToId[shadow[k]];
					// This is the complicated bit...
					if (victim[k] >= 0) {
						// Conflict. Push the item into main inventory.
						// This isn't critical enough to require an alert.
						console.log("Conflict between shadow and vanilla in equip slot " + k + " - pushing item " + shadow[k] + " into main inventory so it's not lost");
						json["player"]["items"][id] = (json["player"]["items"][id] || 0) + 1;
					} else {
						victim[k] = id;
					}
					delete shadow[k];
				}
			}
		}
	}
};

itemAPI.processSave = function (saving, json) {
	for (var k in itemAPI.storageProcessors)
		itemAPI.storageProcessors[k](saving, json);
};

