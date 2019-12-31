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
	}
});

