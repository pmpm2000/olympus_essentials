// ==UserScript==
// @name         Olympus Essentials - bot03
// @namespace    oess
// @author       pmpm2000
// @description  Auto-invite to alliance
// @version      0.0.4
// @downloadURL  https://github.com/pmpm2000/olympus_essentials/raw/main/bot03.user.js
// @updateURL    https://github.com/pmpm2000/olympus_essentials/raw/main/bot03.user.js
// @match        http://*.grepolis.com/game/*
// @match        https://*.grepolis.com/game/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';
// ============================
// SETTINGS FOR SPECIFIC ACCOUNT AND FORUM THREAD
// ============================
    const account = "bot03"; // unique id of the bot's acc - no impact on the code
    const threadId = 2837; // ID of thread that the bot should subscribe
    const townId = 14058; // ID of the bot's town - it needs to own it all the time
// ============================
    const uw = unsafeWindow ? unsafeWindow : window;
    const minSleepTime = 30000; // miliseconds
    const maxSleepTime = 300000; // miliseconds
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
        //console.log('[Olympus Essentials] Error in sending invite to ', nickname);
	}


    function deletePost(postId) {
        let body = {"action":"post_delete","thread_id":threadId,"post_id":postId,"page":1,"town_id":townId,"nl_init":true};
        uw.gpAjax.ajaxPost('alliance_forum', 'forum', body);
        console.log('[Olympus Essentials] Post ', postId, ' deleted.');
    }


    async function checkForum() {
        while(true) {
            let temp = timeToSleep();
            console.log('[Olympus Essentials] Sleeping for ', Math.floor(temp/1000), ' seconds.');
            await sleep(temp);
		    let body = {"type":"go","separate":false,"thread_id":threadId,"page":1,"town_id":townId,"nl_init":true};
		    uw.gpAjax.ajaxPost('alliance_forum', 'forum', body, true, {
				    success: function(layout, resp, succ, t_token) {
					    let text = resp.html;
                        let nicknames = findNicknames(text);
                        let posts = findPostId(text);
                        console.log('[Olympus Essentials] Players to invite: ', nicknames);
                        console.log('[Olympus Essentials] Posts to delete: ', posts);
                        for (let i=0; i<nicknames.length; i++) {
                            inviteToAlliance(nicknames[i], posts[i]);
                            sleep(1000);
                        }
				    }
			    });
        }
    }

    console.log('[Olympus Essentials] Script started.');
    checkForum();
})();
