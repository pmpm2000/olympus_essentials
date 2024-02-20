// ==UserScript==
// @name         Olympus Essentials - library
// @namespace    oess
// @version      0.0.2
// @description  Library for Olympus Essentials
// @author       pmpm2000
// @match        http://*.grepolis.com/game/*
// @match        https://*.grepolis.com/game/*
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    'use strict';
    const uw = unsafeWindow ? unsafeWindow : window;
	// Change all IP addresses for your Discord bot server address. Port 8002 is a standard port for pmpm2000 Discord bot, so don't change it if you don't know what it means to you.
    // "alliance1", "alliance2", "attack" etc. are also default. Don't change.
    const discordUrls = {
        "bot01": "http://123.456.789.012:8002/alliance1",
        "bot02": "http://123.456.789.012:8002/alliance3",
        "bot03": "http://123.456.789.012:8002/alliance2",
        "bot04": "http://123.456.789.012:8002/alliance4",
        "bot05": "http://123.456.789.012:8002/alliance5"
    };
    uw.discordUrls = discordUrls;
    uw.attackUrl = "http://123.456.789.012/attack";
	
	// Change to your alliance prefixes - they are just display names.
    const alliance_prefix = {
        "bot01": "[PREDATORS]",
        "bot02": "[PREDATORS II]",
        "bot03": "[PREDATORS III]",
        "bot04": "[PREDATORS IV]",
        "bot05": "[PREDATORS V]"
    };
    uw.alliance_prefix = alliance_prefix;
	
	// Change to your alliance forum thread's IDs. You can find them by analysing network request when you click on the thread.
    const threadIds = {
        "bot01": 2845,
        "bot02": 1232,
        "bot03": 4325,
        "bot04": 5432,
        "bot05": 6442
    };
    uw.threadIds = threadIds;
	
	// Change to your fake accounts' town IDs.
    const townIds = {
        "bot01": 18816,
        "bot02": 13432,
        "bot03": 10018,
        "bot04": 19200,
        "bot05": 21232
    };
    uw.townIds = townIds;
	
	// translate to your language
    const translations = {
        "attack_detected": " Wykryto atak na swiatynie ",
        "from": ". Wyslano z "
    };
    uw.translations = translations;
	
	// insert Olympus ID - leave -1 if the Olympus doesn't exist yet
	uw.olympusId = -1
})();