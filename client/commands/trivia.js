const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trivia')
        .setDescription('Display help and Trivia Commands.'),
    async execute(interaction) {

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('quickstart')
                    .setLabel('Quick Start')
                    .setStyle('PRIMARY'),
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('reset')
                    .setLabel('Reset')
                    .setStyle('PRIMARY'),
            );    
            
            const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle("TriviaGameBot Commands")
            .setDescription('Here is a list of the bot commands.');
            
            embed.addField("/start", 'Use /start to configure and start a new quiz.', false)
            embed.addField("/quickstart", 'Hit "Quick Start" or use /quickstart to start a preconfigured quiz. 30 seconds. 5 questions.', false)
            embed.addField("/reset", 'Hit "Reset" or use /reset in case the bot gets stuck or you cannot start a quiz anymore.', false)
            embed.setFooter({ text: "TriviaGameBot created by blastbeng#9151" });  

            interaction.reply({ ephemeral: true, components: [row], embeds: [embed] });  
    }
};