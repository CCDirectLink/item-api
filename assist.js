/*
 * CCItemAPI - API for cross-modloader item registration & management
 * Written starting in 2019 by 20kdc
 * To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.
 * You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
 */

// This file assists mod creation with various tweaks.
import itemAPI from './base.js';

const oldItemAPIReg = itemAPI.onItemRegister;
// Setup registration of JSON templates NOW in case anyone does weird timing stuff
itemAPI.onItemRegister = function (id) {
	var name = oldItemAPIReg.apply(this, arguments);
	if (name !== null)
		ig.jsonTemplate.register("customItem." + name, id);
	return name;
};

