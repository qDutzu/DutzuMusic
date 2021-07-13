const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');

const DisTube = require('distube');
const distube = new DisTube(client, { searchSongs: false, emitNewSongOnly: true });

const token = 'NzMyOTIwODc2MzAyOTkxNDAx.Xw7nwQ.bCvFRbQwEm3plFtlOi1hJJCEakU'
const prefix = 'd.';

/////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\
/////////////////BAN / KICK SYSTEM\\\\\\\\\\\\\\\\\\
client.commands = new Discord.Collection();

const CommandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of CommandFiles){
  const command = require(`./commands/${file}`);

  client.commands.set(command.name, command);
}


const memberCount = require('./counters/member-count')


client.on("ready", () => {
  console.log(`${client.user.tag} has logged in.`)

  memberCount(client)
});

/////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////ANTI-SPAM\\\\\\\\\\\\\\\\\\\\\\\
const antispam = require('better-discord-antispam'); // Requiring this module.
const {MessageEmbed} = require("discord.js"); // Requiring this since we need it for embeds later

let authors = []; 
let warned = [];
let punishedList = [];
let messageLog = [];

module.exports = async (client, options) => {
  /* Declaring our options which we are going to work on */
  
  const limitUntilWarn = (options && options.limitUntilWarn) || 3; // Default value: 3. Explication: This is the limit where you get the warn message. If the member X sent over 3 messages within the interval, he get warned
  const limitUntilMuted = (options && options.limitUntilMuted) || 5; // Default value: 5. Explication: This is the limit where you get Punished. If the member X sent over 5 messages within the interval, he get muted.
  const interval = (options && options.interval) || 2000; //Default Time: 2000MS (1000 milliseconds = 1 second, 2000 milliseconds = 2 seconds etc...). Explication: The interval where the messages are sent. Practically if member X sent 5+ messages within 2 seconds, he get muted
  const warningMessage = (options && options.warningMessage) || "dacă nu te oprești din spamming, te voi pedepsi."; // Default Message: if you don't stop from spamming, I'm going to punish you!. Explication: None, it's just a message you get for the warning phase.
  const muteMessage = (options && options.muteMessage) || "ai primit mute,deoarece nu te-ai potolit."; // Default Message: "was muted since we don't like too much advertisement type people!". Explication: The message sent after member X was punished
  const maxDuplicatesWarning = (options && options.maxDuplicatesWarning || 7); // Default value: 7. Explication: When people are spamming the same message, <limitUntilWarn> is ignored and this will trigger when member X sent over 7+ message that are the same.
  const maxDuplicatesMute = (options && options. maxDuplicatesMute || 10); // Deafult value: 10 Explication: The limit where member X get muted after sending too many messages(10+).
  const ignoredRoles = (options && options.ignoredRoles) || []; // Default value: None. Explication: The members with this role(or roles) will be ignored if they have it. Suggest to not add this to any random guys.
  const ignoredMembers = (options && options.ignoredMembers) || []; // Default value: None. Explication: These members are directly affected and they do not require to have the role above. Good for undercover pranks.
  const mutedRole = (options && options.mutedRole) || "muted"; // Default value: muted. Explication: Here you put the name of the role that should not let people write/speak or anything else in your server. If there is no role set, by default, the module will attempt to create the role for you & set it correctly for every channel in your server. It will be named "muted".
  const timeMuted = (options && options.timeMuted) || 1000 * 600; // Default value: 10 minutes. Explication: This is how much time member X will be muted. if not set, default would be 10 min.
  const logChannel = (options && options.logChannel) || "AntiSpam-logs"; // Default value: "AhtiSpam-logs". Explication: This is the channel where every report about spamming goes to. If it's not set up, it will attempt to create the channel.

// If something is added wrong, throw an error

  if(isNaN(limitUntilWarn)) throw new Error("ERROR: <limitUntilWarn> option is not set up right! Please check it again to be a number in settings.");
  if(isNaN(limitUntilMuted)) throw new Error("ERROR: <limitUntilMuted> option is not set up right! Please add a number in settings.");
  if(isNaN(interval)) throw new Error("ERROR: <interval> option is not set up right! Please add a number in settings.");
  if(!isNaN(warningMessage) || warningMessage.length < 5) throw new Error("ERROR: <warningMessage> option must be a string and have at least 5 characters long (Including space).");
  if(!isNaN(muteMessage) || muteMessage.length < 5) throw new Error("ERROR: <muteMessage> option must be a string and have at least 5 characters long (Including space).");
  if(isNaN(maxDuplicatesWarning)) throw new Error("ERROR: <maxDuplicatesWarning> option is not set up right! Please check it again to be a number in settings.")
  if(isNaN(maxDuplicatesMute)) throw new Error("ERROR: <maxDuplicatesMute> option is not set up right! Please check it again to be a number in settings.");
  if(isNaN(timeMuted)) throw new Error("ERROR: <timeMuted> option is not set up right! Please check it again to be a number in settings.");
  if(ignoredRoles.constructor !== Array) throw new Error("ERROR: <ignoredRoles> option is not set up right! Please check it again to be an array in settings.");
  if(ignoredMembers.constructor !== Array) throw new Error("ERROR: <ignoredMembers> option is not set up right! Please check it again to be an array in settings.");
  
  // Custom 'checkMessage' event that handles messages
 client.on("checkMessage", async (message) => {
 
  //time variables
  let clock = new Date();
  let ss = String(clock.getSeconds()).padStart(2, '0');
  let min = String(clock.getMinutes()).padStart(2, '0');
  let hrs = String(clock.getHours()).padStart(1, '0');
  clock = hrs + ':' + min +':' + ss;

  let TheDate = new Date()
  let zilelesaptamanii = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let weekday = zilelesaptamanii[TheDate.getDay()];
  let dd = String(TheDate.getDate()).padStart(2, '0');
  let mon = String(TheDate.getMonth()+ 1);
  let year = String(TheDate.getFullYear()).padStart(4,'00');
  TheDate = weekday+", " + mon + '/' + dd +'/' + year;
  //end of time variables

  //verify if it's pm or AM
  let amORpm;
  if(hrs >= 0 && hrs <= 12){
      amORpm = "AM"
  }else{
      amORpm = "PM"
  };
  // The Mute function.
  const MuteMember = async (m, muteMsg) => {
    for (var i = 0; i < messageLog.length; i++) {
        if (messageLog[i].author == m.author.id) {
          messageLog.splice(i);
        }
      }
  
      punishedList.push(m.author.id);
      
      const user = m.guild.members.cache.get(m.author.id);
      const ReportChannel = m.guild.channels.cache.find(ch => ch.name === logChannel);
      if(!ReportChannel){
        try{
            ReportChannel = await m.guild.channels.create('antispam-logs', {
              type: 'text',
              permissionOverwrites:[{
                id: m.guild.id,
                deny: ['VIEW_CHANNEL']
              }]
            })
              .then(m=> m.send(`A fost creat un canal **\`anti-spam-Logs\`** deoarece nu a fost găsit niciun canal creat de la începutul configurării.`))
              .catch(console.error)
  
        }catch(e){
          console.log(e.stack);
        }
      }; // end of creating the channel for anti spam logs

      const role = m.guild.roles.cache.find(namae => namae.name === mutedRole);      
      if (!role) {
        try {
            role = await m.guild.roles.create({
              data:{
                name: "muted",
                color: 'PURPLE',
                permissions: []
              },
              reason: `Rol-ul de ``muted`` nu a fost găsit. S-a creat un nou rol numit ``muted```
            })
            m.guild.channels.cache.forEach(async (thechann, id) => {
                await thechann.updateOverwrite(role, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false,
                    SEND_TTS_MESSAGES: false,
                    ATTACH_FILES: false,
                    SPEAK: false
                });
            });
           ReportChannel.send(`S-a creat un nou rol de  **\`muted\`** deoarece nu exista.`) 
        } catch (e) {
            console.log(e.stack);
        }
    }//end of creating the role
    
      if (user) {
        user.roles.add(role).then(()=>{
          m.channel.send(`<@!${m.author.id}>, ${muteMsg}`);
          const muteEmbed = new MessageEmbed()
            .setAuthor(' Action | Auto Mute', `https://images-ext-2.discordapp.net/external/Wms63jAyNOxNHtfUpS1EpRAQer2UT0nOsFaWlnDdR3M/https/image.flaticon.com/icons/png/128/148/148757.png`)
            .addField('Member muted:',`${user}`)
            .addField(`How much time got muted?:`,`${timeMuted} seconds (10 min)`)
            .addField('Reason of mute: ', `Spam`)
            .addField(`When it was muted that person:`,TheDate+ " at "+ clock+" "+amORpm)
            .setColor('#7b027d')
          ReportChannel.send(muteEmbed);
          setTimeout(()=>{
            user.roles.remove(role);
            const unmutedEmbed = new MessageEmbed()
              .setAuthor('Action | Auto Unmute')
              .addField(`Member unmuted:`,`${user}`)
              .addField(`Reason of unmute:`,`Time Expired(10 min)`)
              .setColor('#7b027d')
          ReportChannel.send(unmutedEmbed)
          }, timeMuted);
          return true;
       }).catch((e) => {
          m.guild.owner.send(`Oops, seems like i don't have sufficient permissions to mute <@!${message.author.id}>!\n It can be that or another type of error happened! Tell me on github: https://github.com/MirageZoe/ \n Everything happened on ${TheDate} at ${clock} ${amORpm} with message:\n\n\`${e.message}\`\n\n *P.S: If this is the first time getting something like this, most likely because it was not set up good the log channel at beginning and didn't know where to send the reports. Do not panic, next time it will work since he created the channel where to send the reports!*`);
          return false;
      });
    }//end of user
  }
  
    
   // The warning function.
   const WarnMember = async (m, reply) => {
    warned.push(m.author.id);
    m.channel.send(`<@${m.author.id}>, ${reply}`);
   }

    if (message.author.bot) return;
    if (message.channel.type !== "text" || !message.member || !message.guild || !message.channel.guild) return;
   
    if (message.member.roles.cache.some(r => ignoredRoles.includes(r.name)) || ignoredMembers.includes(message.author.tag)) return;

    if (message.author.id !== client.user.id) {
      const currentTime = Math.floor(Date.now());
      authors.push({
        "time": currentTime,
        "author": message.author.id
      });
      
      messageLog.push({
        "message": message.content,
        "author": message.author.id
      });
      
      const msgMatch = 0;
      for (var i = 0; i < messageLog.length; i++) {
        if (messageLog[i].message == message.content && (messageLog[i].author == message.author.id) && (message.author.id !== client.user.id)) {
          msgMatch++;
        }
      }
      
      if (msgMatch == maxDuplicatesWarning && !warned.includes(message.author.id)) {
        WarnMember(message, warningMessage);
      }

      if (msgMatch == maxDuplicatesMute && !punishedList.includes(message.author.id)) {
        MuteMember(message, muteMessage);
      }

      var matched = 0;

      for (var i = 0; i < authors.length; i++) {
        if (authors[i].time > currentTime - interval) {
          matched++;
          if (matched == limitUntilWarn && !warned.includes(message.author.id)) {
            WarnMember(message, warningMessage);
          } else if (matched == limitUntilMuted) {
            if (!punishedList.includes(message.author.id)) {
              MuteMember(message, muteMessage);
            }
          }
        } else if (authors[i].time < currentTime - interval) {
          authors.splice(i);
          warned.splice(warned.indexOf(authors[i]));
          punishedList.splice(warned.indexOf(authors[i]));
        }

        if (messageLog.length >= 200) {
          messageLog.shift();
        }
      }
    }
  });
}

client.on('ready', () => {
  // Module Configuration Constructor
   antispam(client, {
        limitUntilWarn: 3, // The amount of messages allowed to send within the interval(time) before getting a warn.
        limitUntilMuted: 5, // The amount of messages allowed to send within the interval(time) before getting a muted.
        interval: 2000, // The interval(time) where the messages are sent. Practically if member X sent 5+ messages within 2 seconds, he get muted. (1000 milliseconds = 1 second, 2000 milliseconds = 2 seconds etc etc)
        warningMessage: "dacă nu te oprești din spamming, te voi pedepsi.", // Message you get when you are warned!
        muteMessage: "ai primit mute,deoarece nu te-ai potolit.", // Message sent after member X was punished(muted).
        maxDuplicatesWarning: 7,// When people are spamming the same message, this will trigger when member X sent over 7+ messages.
        maxDuplicatesMute: 10, // The limit where member X get muted after sending too many messages(10+).
        ignoredRoles: [""], // The members with this role(or roles) will be ignored if they have it. Suggest to not add this to any random guys. Also it's case sensitive.
        ignoredMembers: ["D u t z u#2892"], // These members are directly affected and they do not require to have the role above. Good for undercover pranks.
		mutedRole: "muted", // Here you put the name of the role that should not let people write/speak or anything else in your server. If there is no role set, by default, the module will attempt to create the role for you & set it correctly for every channel in your server. It will be named "muted".
		timeMuted: 1000 * 600, // This is how much time member X will be muted. if not set, default would be 10 min.
		logChannel: "antispam-logs" // This is the channel where every report about spamming goes to. If it's not set up, it will attempt to create the channel.
      });
      
  // Rest of your code
});

client.on('message', msg => {
  client.emit('checkMessage', msg); // This runs the filter on any message bot receives in any guilds.
  
  // Rest of your code
});
/////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////ANTI-SPAM\\\\\\\\\\\\\\\\\\\\\\\


/////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\
//////////////////DISCORD-STATUS\\\\\\\\\\\\\\\\\\\\
client.on('ready', () => {
  client.user.setPresence({
    status: 'dnd',
    activity: {
        name: 'd.help',
        type: 'LISTENING',
        url: 'https://www.youtube.com/watch?v=xfdue4jdow0'
    }
  });
});
/////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\
//////////////////DISCORD-STATUS\\\\\\\\\\\\\\\\\\\\

//////////////////////-\\\\\\\\\\\\\\\\\\\\\\\
////////////////MUSIC COMMANDS\\\\\\\\\\\\\\\\\
client.on("message", async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift();

    if (command == "play") {
        if (!message.member.voice.channel) return message.channel.send(` **You are not in a voice channel.** `);
        if (!args[0]) return message.channel.send(` **You must state something to play.** `);
        distube.play(message, args.join(" "));
    }

    if (command == "stop" || command == "leave") {
        const bot = message.guild.members.cache.get(client.user.id);
        if (!args[0])
        if (bot.voice.channel !== message.member.voice.channel) return message.channel.send(` **You are not in the same voice channel as the bot.** `);
        distube.stop(message);
        message.channel.send(' **You have stopped the music.** ')

    }

    if (["repeat", "loop"].includes(command)) {
        let node = distube.setRepeatMode(message, parseInt(args[0]));
        node = node ? node == 2 ? "Repeat queue" : "Repeat song" : "Off";
        message.channel.send("Set repeat mode to `" + node + "`");

    }

    if (command == "skip") {
        distube.skip(message);
        message.channel.send(' **Skipped!** ');

    }

    if (command == "queue") {
        let queue = distube.getQueue(message);
        message.channel.send('**Current queue:**\n' + queue.songs.map((song, id) =>
            `**${id + 1}**. ${song.name} - \`${song.formattedDuration}\``
            ).slice(0, 10).join("\n"));

    }
    
    if ([`3d`, `bassboost`, `echo`, `karaoke`, `nightcore`, `vaporwave`, `flanger`, `gate`, `haas`, `reverse`, `surround`, `mcompand`, `phaser`, `tremolo`, `earwax`].includes(command)) {
        let filter = distube.setFilter(message, command);
        message.channel.send("Current queue filter: " + (filter || "Off"));
    
    }

    client.on('message', message => {
      if (message.content === 'spam') {
          message.channel.send('spam');
          while (message.channel.send('spam')) {
              if (message.content === 'stop spam') {
                  return message.channel.send('stopped');
              }
          }
      }
  });
    
    //////////////////////-\\\\\\\\\\\\\\\\\\\\\\\
    /////////////////HELP COMMAND\\\\\\\\\\\\\\\\\\

    if (command == "help") {
        const sectionEmbed = new Discord.MessageEmbed()
         .setColor('PURPLE')
         .setThumbnail('https://i.imgur.com/Jz9mtYx.gif')
         .setFooter(`Solicitate de ${message.author.tag}`,message.author.displayAvatarURL())
         .setTitle('**Help Panel**')
         .setDescription('Prefixul principal al acestui ``BOT`` este ``d.``')
         .addField('**Help Command**', '``help``')
         .addField('**Bot Command**', '``ping``, ``clear``')
         .addField('**Music Command**', '``play``, ``stop``, ``leave``, ``repeat``, ``loop``, ``skip``, ``queue``')
         .addField('**Filter Command**', '``3d``, ``bassboost``, ``echo``, ``karaoke``, ``nightcore``, ``vaporwave``, ``flanger``, ``gate``, ``haas``, ``reverse``, ``surround``, ``mcompand``, ``phaser``, ``tremolo``, ``earwax``')
         .addField('**Mute Info**', '``System Mute`` **- Va trebui să aveți un rol numit ``muted`` și să-i faceți permisiunile **``"Send Messages / Attach Files / Add Reactions / Send Text-to-Speech Messages"`` **să nu fie permise pe canal, unde să sincronizați celelalte canale pentru a nu mai avea acces rol-ul de** ``muted`` **să scrie.**')
         .setTimestamp()
         .setFooter(`Solicitat de ${message.author.tag}`, 'https://i.imgur.com/Jz9mtYx.gif');
        //  .setDescription('**Foloseste ``!help`` ``numele sectiunii`` pentru a accesa alte secțiuni.**\n**Secțiuni:**\n➤ Moderation\n➤ Information\n➤ Music\n➤ Fun\n➤ Tool')
        //  .addField('Fun Commands', 'Commands that all users can user that are for fun and have no purpose.')
        //  .addField('Information Commands', 'Command that return some form of important information.')
        //  .addField('Moderation Commands', 'Commands that are for moderation purpose within a server.')
        //  .addField('Tool Commands', 'Commands that add features to a server.')
        //  .addField('Music Commands', 'Commands for music.')
        //  .setFooter(client.user.tag, client.user.displayAvatarURL());

        // const infoEmbed = new Discord.MessageEmbed()
        //  .setTitle('Information Commands.')
        //  .addField('Help Commands', 'This commands shows the user all the commands possible.')
        //  .addField('Social Command', 'Displays social media in an embed.');

        // const funEmbed = new Discord.MessageEmbed()
        //  .setTitle('Fun Commands.')
        //  .addField('Avatar Command', 'Returns a user avatar.')
        //  .addField('Meme Commands', 'Returns a Meme to the channel.')
        //  .addField('Say Command', 'Make the bot say a message to the channel')
        //  .addField('Snipe Command', 'Returns the last deleted message within a channel.');

        // const moderationEmbed = new Discord.MessageEmbed()
        //  .setTitle('Moderation Commands.')
        //  .addField('Ban Command', 'Bans a member from the server.')
        //  .addField('Kick Command', 'Kicks a member from the server.')
        //  .addField('Mute Command', 'Mutes a member in the server.')
        //  .addField('Clear Command', 'Clears messages within a channel.')
        //  .addField('Unban Command', 'Unbans a member from the server.')
        //  .addField('Unmute Command', 'Unmutes a member in a server.')
        //  .addField('Tempban Command', 'Tempbans a member from the server.')
        //  .addField('Tempmute Command', 'Tempmutes a member in a server.');

        // const toolEmbed = new Discord.MessageEmbed()
        //  .setTitle('Tool Commands')
        //  .addField('Verify Command', 'Gives the user the member role for the server.');

        // const musicEmbed = new Discord.MessageEmbed()
        //  .setTitle('Music Commands')
        //  .addField('Play Command', 'Play the music.')
        //  .addField('Stop Command', 'Stop the music.')
        //  .addField('Skip Command', 'Skip the music.')
        //  .addField('Repeat Command', 'Repeat the music.')
        //  .addField('Filter Command:3d, bassboost, echo, karaoke, nightcore, vaporwave', 'Add a filter to your music.')

        if (!args[0]) return message.channel.send(sectionEmbed);
        // if (args[0] == 'information') return message.channel.send(infoEmbed);
        // else if (args[0] == 'fun') return message.channel.send(funEmbed);
        // else if (args[0] == 'tool') return message.channel.send(toolEmbed);
        // else if (args[0] == 'moderation') return message.channel.send(moderationEmbed);
        // else if (args[0] == 'music') return message.channel.send(musicEmbed);

    
    }
  });

//////////////////////-\\\\\\\\\\\\\\\\\\\\\\\
////////////////MUSIC COMMANDS\\\\\\\\\\\\\\\\\

////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\    
////////////////CLEAR-COMMAND\\\\\\\\\\\\\\\\\\\\\
    client.on('message', (message) => {
      if (!message.content.startsWith(prefix) || message.author.bot) return;
    
      const args = message.content
        .toLowerCase()
        .slice(prefix.length)
        .trim()
        .split(/\s+/);
      const [command, input] = args;
    
      if (command === 'clear' || command === 'c') {
        if (!message.member.hasPermission('MANAGE_MESSAGES')) {
          return message.channel
            .send(
              "Nu poti utiliza aceasta comanda. Iți lipseste permisiunea `manage_messages`.",
            );
        }
    
        if (isNaN(input)) {
          return message.channel
            .send('Introdu cantitatea de mesaje pe care dorești să ștergi.')
            .then((sent) => {
              setTimeout(() => {
                sent.delete();
              }, 2500);
            });
        }

            
        if (Number(input) < 0) {
          return message.channel
            .send('Inserează un număr pozitiv.')
            .then((sent) => {
              setTimeout(() => {
                sent.delete();
              }, 2500);
            });
        }
    
        // add an extra to delete the current message too
        const amount = Number(input) > 100
          ? 101
          : Number(input) + 1;
    
        message.channel.bulkDelete(amount, true)
        .then((_message) => {
          message.channel
            // do you want to include the current message here?
            // if not it should be ${_message.size - 1}
            .send(`Am sters \`${_message.size}\` mesaje :broom:`)
            .then((sent) => {
              setTimeout(() => {
                sent.delete();
              }, 2500);
            });
        });
      }
    });
////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\    
////////////////CLEAR-COMMAND\\\\\\\\\\\\\\\\\\\\\


// Queue status template

const status = (queue) => `*Volume:* \`${queue.volume}%\` | *Filter:* \`${queue.filter || "Off"}\` | *Loop:* \`${queue.repeatMode ? queue.repeatMode == 2 ? "All Queue" : "This Song" : "Off"}\` | *Autoplay:* \`${queue.autoplay ? "On" : "Off"}\``;
// DisTube event listeners, more in the documentation page
distube
        .on("playSong", (message, queue, song) => message.channel.send(
            `**:musical_note: Playing** \`${song.name}\` - \`${song.formattedDuration}\`\n**🍹Requested by:** ${song.user}\n${status(queue)}` 
        ))
        .on("addSong", (message, queue, song) => message.channel.send(
            `**:notepad_spiral: Added** ${song.name} - \`${song.formattedDuration}\` **to the queue by ${song.user}**`
        ))
        .on("playList", (message, queue, playlist, song) => message.channel.send(
            `💜Play \`${playlist.name}\` playlist (${playlist.songs.length} songs).\nRequecsted by: ${song.user}\nNow playing \`${song.name}\` - \`${song.formattedDuration}\`\n${status(queue)}`
        ))
        .on("addList", (message, queue, playlist) => message.channel.send(
            `🤍Added \`${playlist.name}\` playlist (${playlist.songs.length} songs) to queue\n${status(queue)}`
        ))
        // DisTubeOptions.searchSongs = true
        .on("searchResult", (message, result) => {
            let i = 0;
            message.channel.send(`**Choose an option from below**\n${result.map(song => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")}\n*Enter anything else or wait 60 seconds to cancel*`);
        })
        // DisTubeOptions.searchSongs = true
        .on("searchCancel", (message) => message.channel.send(`Searching canceled`))
        .on("error", (message, e) => {
            console.error(e)
            message.channel.send("An error encountered: " + e);
        });


        client.on('message', message =>{

          if(!message.content.startsWith(prefix) || message.author.bot) return;

          const args = message.content.slice(prefix.length).split(/ +/);
          const command = args.shift().toLowerCase();

          if(command === 'clear'){
            client.commands.get('clear').execute(message, args);
          }
          else if(command === 'kick'){
            client.commands.get('kick').execute(message, args);
          }else if(command === 'ban'){
            client.commands.get('ban').execute(message, args);
          }
        }) 


  client.login(token);
