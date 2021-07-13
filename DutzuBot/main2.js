const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js');
const client = new Discord.Client();
const bot = new Discord.Client();

const DisTube = require('distube');
const distube = new DisTube(client, { searchSongs: false, emitNewSongOnly: true });

const token = 'NzMyOTIwODc2MzAyOTkxNDAx.Xw7nwQ.bCvFRbQwEm3plFtlOi1hJJCEakU'
const prefix = '!';

client.on("message", message =>{
 let msg = message.content.toUpperCase();
 let sender = message.author;
 let cont = message.content.slice(prefix.length).slice(" ");
 let args = cont.slice(1)

 if (msg === prefix + "PING"){

    message.channel.send("Pong!");
 }

});

  client.on('ready', () => {
    client.user.setPresence({
      status: 'dnd',
      activity: {
          name: 'ɪ ᴍᴀᴋᴇ ᴍʏ ᴍᴏɴᴇʏ ᴏɴ ᴍʏ ᴏᴡɴ.',
          type: 'STREAMING',
          url: 'https://www.youtube.com/watch?v=xfdue4jdow0'
      }
    });
  });


  client.on("ready", () => {
      console.log(`${client.user.tag} has logged in.`)
  });


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
  
    if (command === 'help') {
      const newEmbed = new MessageEmbed()
        .setColor('#800080')
        .setTitle('**Clear Help**')
        .setDescription(
          `Această comandă șterge de exemplu mesajele \`${prefix}clear 5\` or \`${prefix}c 5\`.`,
        )
        .setFooter(
          `Solicitat de ${message.author.tag}`,
          message.author.displayAvatarURL(),
        )
        .setTimestamp();
  
      message.channel.send(newEmbed);
    }
  });


    client.on("message", async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift();

    // Queue status template
    const status = (queue) => `Volume: \`${queue.volume}%\` | Filter: \`${queue.filter || "Off"}\` | Loop: \`${queue.repeatMode ? queue.repeatMode == 2 ? "All Queue" : "This Song" : "Off"}\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;

    if (command == "play") {
        if (!message.member.voice.channel) return message.channel.send(` **You are not in a voice channel.** `);
        if (!args[0]) return message.channel.send(` **You must state something to play.** `);
        distube.play(message, args.join(" "));
    }

    if (command == "stop") {
        const bot = message.guild.members.cache.get(client.user.id);
        if (!args[0]) return message.channel.send(` **You must state something to play.** `);
        if (bot.voice.channel !== message.member.voice.channel) return message.channel.send(` **You are not in the same voice channel as the bot.** `);
        distube.stop(message);
        message.channel.send(' **You have stopped the music.** ')

    }

    if (["repeat", "loop"].includes(command)) {
        distube.setRepeatMode(message, parseInt(args[0]));
        distube.loop(message);
        message.channel.send(' **Looping** ')


    }

    if (command == "skip") {
        distube.skip(message);
        message.channel.send(' *Skipped the music.* ');

    }
    
    if (command == "queue") {
    let queue = distube.getQueue(message);
    message.channel.send('Current queue:\n' + queue.songs.map((song, id) =>
        `**${id + 1}**. ${song.name} - \`${song.formattedDuration}\``
    ).slice(0, 10).join("\n"));

    }

    });
    // DisTube event listeners, more in the documentation page
    distube
        .on("playSong", (message, queue, song) => message.channel.send(
            `Playing \`${song.name}\` - \`${song.formattedDuration}\`\nRequested by: ${song.user}\n${status(queue)}`
        ))
        .on("addSong", (message, queue, song) => message.channel.send(
            `Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`
        ))
        .on("playList", (message, queue, playlist, song) => message.channel.send(
            `Play \`${playlist.name}\` playlist (${playlist.songs.length} songs).\nRequested by: ${song.user}\nNow playing \`${song.name}\` - \`${song.formattedDuration}\`\n${status(queue)}`
        ))
        .on("addList", (message, queue, playlist) => message.channel.send(
            `Added \`${playlist.name}\` playlist (${playlist.songs.length} songs) to queue\n${status(queue)}`
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

client.login(token);