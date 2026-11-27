/*
 * CCItemAPI - API for cross-modloader item registration & management
 * Written starting in 2019 by 20kdc
 * To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.
 * You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
 */

window.itemAPI = {
	idToCustomItem: {},
	customItemToId: {},
	//No "inverse" exists for this, as converting back to these names should not be used the same as modded item ids do
	vanillaItemToID: {},
	/**
	 * Checks the item with the given ID for the "customItem" key.
	 * I don't recommended using this after the game has started, as this'll crash if a save with the item has been loaded before this is called.
	 * Ideally, you would patch the Item Database via a standard patching method, which allows the customItem key to be handled.
	 * 
	 * @param {number} id The item's current ID.
	 * @return {string?} The custom item name, or null otherwise
	 */
	onItemRegister: function (id) {
		var item = sc.inventory.items[id];
		if ("customItem" in item) {
			var name = item["customItem"];
			if (name in this.vanillaItemToID)
				throw new Error("Item was registered with conflicting name ; there is already a vanilla item with name " + name + ".");
			if (name in this.customItemToId)
				throw new Error("Item was registered too late ; there is already a custom item with name " + name + ".");
			this.idToCustomItem[id] = name;
			this.customItemToId[name] = id;
			return name;
		}
		return null;
	},

	/**
	 * Gets an item's ID from either a string or a number.
	 * This is cleaner than the old method of accessing customItemToId directly, as this allows expandability.
	 * @param {number | string} itemID An item ID or customItem.
	 * @return {number?} The item's numeric ID or null.
	 */
	getItemID: function (itemID) {
		// Already in proper form
		if(itemID instanceof Number) return itemID
		// Check vanilla
		let vanillaID = this.vanillaItemToID[itemID];
		if(vanillaID) return vanillaID;
		// Check modded items
		return this.customItemToId[itemID] || itemID;
	}
};

export default window.itemAPI;
