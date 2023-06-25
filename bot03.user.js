// ==UserScript==
// @name         Olympus Essentials - bot03
// @namespace    oess
// @author       pmpm2000
// @description  Auto-invite to alliance
// @version      0.0.0
// @downloadURL  https://github.com/pmpm2000/olympus_essentials/blob/main/bot03.user.js
// @updateURL    https://github.com/pmpm2000/olympus_essentials/blob/main/bot03.user.js
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
    const threadId = 2838; // ID of thread that the bot should subscribe
    const townId = 12876; // ID of the bot's town - it needs to own it all the time
// ============================
    const uw = unsafeWindow ? unsafeWindow : window;
    const refreshRate = 30000; // miliseconds - how often should the bot search for new posts
	function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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


	async function inviteToAlliance(nickname) {
        sleep(1000);
		let body = {"player_name":nickname,"town_id":townId,"nl_init":true};
		uw.gpAjax.ajaxPost('alliance', 'invite', body);
        console.log('[Olympus Essentials] Invite sent to ', nickname);
	}


    async function deletePost(postId) {
        sleep(1000);
        let body = {"action":"post_delete","thread_id":threadId,"post_id":postId,"page":1,"town_id":townId,"nl_init":true};
        uw.gpAjax.ajaxPost('alliance_forum', 'forum', body);
    }


    async function checkForum() {
        while(true) {
            await sleep(refreshRate);
//            testt();
		    let body = {"type":"go","separate":false,"thread_id":threadId,"page":1,"town_id":townId,"nl_init":true};
		    uw.gpAjax.ajaxPost('alliance_forum', 'forum', body, true, {
				    success: function(layout, resp, succ, t_token) {
					    let text = resp.html;
                        let uniqueNicknames = [...new Set(findNicknames(text))];
                        let posts = findPostId(text);
                        console.log('[Olympus Essentials] Players to invite: ', uniqueNicknames);
                        console.log('[Olympus Essentials] Posts to delete: ', posts);
                        for (let i=0; i<uniqueNicknames.length; i++) {
                            inviteToAlliance(uniqueNicknames[i]);
                        }
                        for (let i=0; i<posts.length; i++) {
                            deletePost(posts[i]);
                        }
				    }
			    });
        }
    }


//    function testt() {
//        var temple_commands = views.layout.layout_toolbar_activities.controller.getTempleCommands();
//        console.log('Wartość temple_commands:', temple_commands);
//   }


    console.log('[Olympus Essentials] Script started.');
    checkForum();
})();
