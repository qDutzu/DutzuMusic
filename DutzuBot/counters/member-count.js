module.exports = async (client) => {  //Gaze
    const guild = client.guilds.cache.get('776765578400104448');
    setInterval(() => {
        const memberCount = guild.memberCount;
        const channel = guild.channels.cache.get('852911346492506132');
        channel.setName(`Members: ${memberCount.toLocaleString()}`);
        console.log('Updating Member Count');
    }, 5000);
}


module.exports = async (client) => {  //Dutzu
    const guild = client.guilds.cache.get('769538180114153483');
    setInterval(() => {
        const memberCount = guild.memberCount;
        const channel = guild.channels.cache.get('852899536355590174');
        channel.setName(`Members: ${memberCount.toLocaleString()}`);
        console.log('Updating Member Count');
    }, 5000);
}
