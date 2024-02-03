# Description
Olympus Essentials is a script for Grepolis Olympus worlds. It offers a set of tools automating processes and has Discord integration.
Very useful when you have a few alliances with different bonuses from temples and you often need to change alliance.

# Features
1. Automatic invites to alliances by post on alliance forum.
2. Automatic invites to alliances by message on Discord server.
3. Alarms from temples - Discord notification on every temple attack.

# Future Plans
1. Automatic leader permissions for authorised players.

# Setup
1. You need a computer/virtual machine for every alliance you want to serve. It's very important that their IP addresses must be different. I recommend using Tor Browser.
2. Create one fake account for every alliance, join and give them inviting permissions.
3. Install scripts with Tampermonkey. For example, if you have 2 alliances, install bot01.user.js in the first VM and bot02.user.js in the second one.
4. Download "oess_library.user.js" and fill it with your data.
5. Tampermonkey > Dashboard > Settings > Change Config Mode to Advanced; check "Update disabled scripts" and "Don't ask me for simple script updates"; change "Check Interval" to "Every 6 Hours".
6. Create invite posts in shared alliance forum - one post per alliance and edit it. Change something and save - there must be a sign "Edited by...".
7. Configure your Discord bot - it is almost ready here https://github.com/pmpm2000/grepolis-dionizje
8. Turn on all scripts. Data is refreshed every 30-120 seconds (randomly), so you have to wait up to 2 minutes to be invited or alarmed.