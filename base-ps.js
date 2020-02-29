/*
 * CCItemAPI - API for cross-modloader item registration & management
 * Written starting in 2019 by 20kdc
 * To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.
 * You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
 */

// Load custom items.
sc.Inventory.inject({
	onload: function (a) {
		this.parent(a);
		for (var i = 0; i < this.items.length; i++)
			if (this.items[i])
				window.itemAPI.onItemRegister(i);
	},
	getItem: function (b) {
		var c = window.itemAPI.customItemToId[b];
		c && (b = c);
		return b < 0 ? null : this.items[b];
	},
	addItem: function(a, c, d, e) {
		var f = window.itemAPI.customItemToId[b];
		f && (a = f);
        if (!(a < 0)) {
            this.items[a] = this.items[a] ? Math.min(this.items[a] + (c | 0), 99) : c | 0;
            this._addNewItem(a);
            sc.stats.addMap("items", "total", c);
            sc.stats.addMap("items", a, c);
            b.id = a;
            b.amount = c;
            b.skip = d;
            b.cutscene = e;
            sc.Model.notifyObserver(this, sc.PLAYER_MSG.ITEM_OBTAINED,
                b)
        }
    },
    isBuffID: function(b) {
		return this.getItem(b).isBuff
    },
    isEquipID: function(b) {
		return this.getItem(b).type == sc.ITEMS_TYPES.EQUIP
    },
    getItemNameWithIcon: function(b) {
		b = this.getItem(b);
		return !b ? "" : "\\i[" + (b.icon + this.getRaritySuffix(b.rarity || 0) || "item-default") + "]" + ig.LangLabel.getText(b.name)
	},
	getItemIcon: function(b) {
		b = this.getItem(b);
		if (!b)
			return null;
		return !b ? "item-default" : "\\i[" + (b.icon + this.getRaritySuffix(b.rarity || 0) || "item-default") + "]"
	},
	getItemDescription: function(b) {
		b = this.getItem(b);
		return b ? ig.LangLabel.getText(b.description) : ""
	},
	getItemRarity: function(b) {
		b = this.getItem(b);
		return !b ? null : b.rarity
	},
	getItemSubType: function(b) {
		b = this.getItem(b);
		return !b ? null : b.equipType
	},
	isConsumable: function(b) {
		b = this.getItem(b);
		return !b ? false : b.type == sc.ITEMS_TYPES.CONS
	},
});

// Devs be violating abstraction barriers I swear to god.
sc.ItemContent.inject({
	init: function(b, a) {
		var c = window.itemAPI.customItemToId[b];
		c && (b = c);
		this.parent(b, a);
	}
});
