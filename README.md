# item-api
Original project by 20kdc. Recovered for general community usage

## Guide for Mod Developers
So, you want to add custom items into CrossCode? Here's the steps to doing exactly that!

### 1. Patching to the Item Database
Create a JSON patch file (with the `.json.patch` extension) in the `assets/data` directory of your mod. Within the file, add in code that looks somewhat like this:

```json
[{
  "type": "ENTER",
  "index": "items"
},{
  "type": "ADD_ARRAY_ELEMENT",
  "content":
  {
    "order": "This is a number that is used to sort your item in item lists",
    "customItem": "A string label used by item-api to find your custom item, regardless of when the item gets added to the database",
    "name": {
      "en_US": "Here's the English translation of your item's name",
      "langUid": 0
    },
    "description": {
      "en_US": "This is an item description. \\c[3]Here's some fancy yellow text\\c[0]. \\c[2]And some green text\\c[0].",
      "langUid": 1
    },
    "type": "String showing item type. CONS-consumable, EQUIP-equipment, TRADE-trade item, KEY-key item, TOGGLE-add ons",
    "rarity": "A number determining item rarity. 0-white, 1-bronze, 2-silver, 3-gold, 4-unique, 5-backer",
    "cost": "A number that shows how much does this item costs to buy. Used in trades and shops alike.",
    "level": "A number showing the item's level. This is 1 for anything not an equipment",
    "icon": "String showing item icon. Usually is item-x, with x being anything in [items, sword, helm, belt, shoe, trade, key, toggle].",
    "effect": {
      "sheet": "drops",
      "name": "circle"
    },
    "more": "There are more properties that are unique to each of the item types. Take a look at item-database.json to figure them out!"
  }
},{
  "type": "EXIT"
}]
```

Assuming you have a patching framework installed (such as the one found in the `simplify` mod), this takes care of the main task of adding items into CrossCode.

### 2. Using Custom Items in Other Data Files
Given that multiple mods may have added items to the item database in different orders, there is no guarantee that any given custom item will always have the same ID across every CrossCode installation.

This is where `item-api` works its magic. Its key functionality is allowing custom items to have a `customItem` alias that is two-way mapped to the custom item's current ID. To use such a custom item in place of a normal item ID for specifying anything that adds an item, such as enemy item drops or trader offerings, simply use the item's `customItem` alias in place of the usual numeric item ID. If using custom items causes the game to break and crash, please file an issue to this repo, with sufficient details to replicate the bug with.

With that in mind, happy modding, developers! *- Bakafish*
