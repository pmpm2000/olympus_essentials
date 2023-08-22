// ==UserScript==
// @name         Olympus Essentials - bot03
// @namespace    oess
// @author       pmpm2000
// @description  Auto-invite to alliance by alliance forum, invite through discord bot, alarms from temples
// @version      0.3.2
// @connect      *
// @downloadURL  https://github.com/pmpm2000/olympus_essentials/raw/main/bot03.user.js
// @updateURL    https://github.com/pmpm2000/olympus_essentials/raw/main/bot03.user.js
// @match        http://*.grepolis.com/game/*
// @match        https://*.grepolis.com/game/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';
    const uw = unsafeWindow ? unsafeWindow : window;
    const account = "bot03"; // unique id of the bot's acc - used to get data from external library
    const minSleepTime = 30000; // miliseconds
    const maxSleepTime = 120000; // miliseconds
    let threadId=0, townId=0;

// ============= FORUM INVS =============
    function findNicknames(text) {
        const nicknames = [];
        const toFind = "openPlayerProfile(&#039;";

        let startIndex = text.indexOf(toFind);
        startIndex = text.indexOf(toFind, startIndex+1);
        startIndex = text.indexOf(toFind, startIndex+1);
        while (startIndex !== -1) {
            const endIndex = text.indexOf("&", startIndex + toFind.length);
            if (endIndex !== -1) {
            const nickname = text.substring(startIndex + toFind.length, endIndex);
            nicknames.push(nickname);
            startIndex = text.indexOf(toFind, endIndex);
            }
            else break;
        }
        return nicknames;
    }


    function findPostId(text) {
        const posts = [];
        const toFind = "id=\"post_";

        let startIndex = text.indexOf(toFind);
        startIndex = text.indexOf(toFind, startIndex+1);
        while (startIndex !== -1) {
            const endIndex = text.indexOf("\">", startIndex + toFind.length);
            if (endIndex !== -1) {
            const post = text.substring(startIndex + toFind.length, endIndex);
            posts.push(parseInt(post));
            startIndex = text.indexOf(toFind, endIndex);
            }
            else break;
        }
        return posts;
    }


	function inviteToAlliance(nickname, postId) {
        let ret = 0;
		let body = {"player_name":nickname,"town_id":townId,"nl_init":true};
		uw.gpAjax.ajaxPost('alliance', 'invite', body, true, {
            success: function() {
                console.log('[Olympus Essentials] Invite sent to ', nickname);
                deletePost(postId);
            },
            error: function(layout, resp) {
                if (resp.error == "Ten gracz został już zaproszony." || resp.error == "Ten gracz jest już członkiem tego sojuszu.") {
                    console.log('[Olympus Essentials] Player ', nickname, ' already invited.');
                    deletePost(postId);
                }
            }
        });
	}


    function deletePost(postId) {
        if (postId == -1) return;
        let body = {"action":"post_delete","thread_id":threadId,"post_id":postId,"page":1,"town_id":townId,"nl_init":true};
        uw.gpAjax.ajaxPost('alliance_forum', 'forum', body);
        console.log('[Olympus Essentials] Post ', postId, ' deleted.');
    }


    function checkForum() {
		    let body = {"type":"go","separate":false,"thread_id":threadId,"page":1,"town_id":townId,"nl_init":true};
		    uw.gpAjax.ajaxPost('alliance_forum', 'forum', body, true, {
				    success: function(layout, resp, succ, t_token) {
					    let text = resp.html;
                        let nicknames = findNicknames(text);
                        let posts = findPostId(text);
                        console.log('[Olympus Essentials] Players to invite (forum): ', nicknames);
                        console.log('[Olympus Essentials] Posts to delete: ', posts);
                        for (let i=0; i<nicknames.length; i++) {
                            inviteToAlliance(nicknames[i], posts[i]);
                        }
				    }
			    });
    }

// ============= DISCORD INVS & PERMS =============
    function checkDiscord() {
        GM_xmlhttpRequest({
            method: "GET",
            url: uw.discordUrls[account], // data from external library
            headers: {
                "Content-Type": "application/json"
            },
            responseType: "json",
            onload: function(response) {
                let toInvite = response.response.invites;
                console.log("[Olympus Essentials] Players to invite (Discord):", toInvite);
                for(let i=0; i<toInvite.length; i++) {
                    inviteToAlliance(toInvite[i], -1);
                }
            },
            onerror: function(a) {
                console.log("[Olympus Essentials] Error:", a);
            }
        });
    }


// ============= TEMPLE ALARMS =============
    let alarmedAttacks = [];

    function findTempleIds(text) {
        let temples = [];
        const toFind = "data-temple_id=\"";
        let startIndex = text.indexOf(toFind);
        while (startIndex !== -1) {
            let endIndex = text.indexOf("\">", startIndex + toFind.length);
            if (endIndex !== -1) {
                const temple = text.substring(startIndex + toFind.length, endIndex);
                try {
                    temples.push(parseInt(temple));
                } catch {
                    startIndex = text.indexOf(toFind, endIndex);
                    continue;
                }
                startIndex = text.indexOf(toFind, endIndex);
            }
            else break;
        }
        temples.splice(temples.length-1, 1);
        return temples;
    }

    function alarm(temple_name, origin_town_name, sender_name, movement_id) {
        let str = uw.alliance_prefix[account] + uw.translations.attack_detected + temple_name + uw.translations.from + origin_town_name + " (" + sender_name + ")";
        console.log("[Olympus Essentials]", str);
        GM_xmlhttpRequest({
            method: "POST",
            url: uw.attackUrl,
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({
                message: str,
                id: movement_id
            })
        });
    }

    function ifAttack(movement) {
        if(movement.type == "support" || alarmedAttacks.includes(movement.id)) return;
        alarmedAttacks.push(movement.id);
        const temple_name = movement.destination_town_name;
        const origin_town_name = movement.origin_town_name;
        const sender_name = movement.sender_name;
        const movement_id = movement.id;
        alarm(temple_name, origin_town_name, sender_name, movement_id);
    }

    function checkIndividualTemple(templeId) {
        const dataget = {"window_type":"olympus_temple_info","tab_type":"index","known_data":{"models":["Olympus"],"collections":["Temples","CustomColors"],"templates":["olympus_temple_info__temple_info","olympus_temple_info__command","olympus_temple_info__revolt","olympus_temple_info__temple_info_image","olympus_temple_info__temple_info_image_olympus","olympus_temple_info__olympus_curse","olympus_temple_info__temple_powers_overlay"]},"arguments":{"target_id":templeId,"activepagenr":0},"town_id":townId,"nl_init":true}
        uw.gpAjax.ajaxGet('frontend_bridge', 'fetch', dataget, true, function(resp) {
            resp.models.TempleInfo.data.movements.forEach(ifAttack);
        });
    }

    function checkTemples() {
        const data = {"town_id":townId,"nl_init":true};
        uw.gpAjax.ajaxPost('alliance', 'temple_overview', data, true, function(resp) {
            let templeIds = findTempleIds(resp.html);
            console.log("[Olympus Essentials] Temples to check:", templeIds);
            templeIds.forEach(checkIndividualTemple);
        });
    }

// ============= HELPERS =============
    function initialize() {
        threadId = uw.threadIds[account]; // ID of thread that the bot should subscribe
        townId = uw.townIds[account]; // ID of the bot's town - it needs to own it all the time
    }


	function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    function timeToSleep() {
        return minSleepTime + Math.floor(Math.random() * (maxSleepTime - minSleepTime));
    }

    async function waitForRefresh() {
        while(true) {
            let temp = timeToSleep();
            console.log('[Olympus Essentials] Sleeping for', Math.floor(temp/1000), 'seconds.');
            await sleep(temp);
            checkForum();
            checkDiscord();
            await sleep(6000);
            checkTemples();
        }
    }

    setTimeout(function() {
        console.log('[Olympus Essentials] Script started.');
        initialize();
        waitForRefresh();
    }, 5000);
})();
