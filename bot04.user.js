// ==UserScript==
// @name         Olympus Essentials - bot04
// @namespace    oess
// @author       pmpm2000
// @description  Auto-invite to alliance by alliance forum, invite through discord bot
// @version      0.1.0
// @connect      *
// @downloadURL  https://github.com/pmpm2000/olympus_essentials/raw/main/bot04.user.js
// @updateURL    https://github.com/pmpm2000/olympus_essentials/raw/main/bot04.user.js
// @match        http://*.grepolis.com/game/*
// @match        https://*.grepolis.com/game/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';
    const uw = unsafeWindow ? unsafeWindow : window;
    const account = "bot04"; // unique id of the bot's acc - used to get data from external library
    const minSleepTime = 30000; // miliseconds
    const maxSleepTime = 120000; // miliseconds
    let threadId=0, townId=0;


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
            const endIndex = text.indexOf("\\", startIndex + toFind.length);
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


    async function waitForRefresh() {
        while(true) {
            let temp = timeToSleep();
            console.log('[Olympus Essentials] Sleeping for ', Math.floor(temp/1000), ' seconds.');
            await sleep(temp);
            checkForum();
            checkDiscord();
        }
    }

    setTimeout(function() {
        console.log('[Olympus Essentials] Script started.');
        initialize();
        waitForRefresh();
    }, 2000);
})();
