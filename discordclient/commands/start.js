const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const utils = require("../utils/utils.js");

const config = require("../config.json");
const http = require("http");

const port_trivia=config.TRIVIA_API_PORT;
const hostname=config.API_HOSTNAME;


module.exports = {
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('Start a Quiz.')
        .addStringOption(option =>
            option.setName('category')
                .setDescription('Select the Quiz category')
                .setRequired(true)
                .addChoice('Any Category',                                         'any')
                .addChoice('General Knowledge',                                    '9'  ) 
                .addChoice('Entertainment: Books',                                 '10' ) 
                .addChoice('Entertainment: Film',                                  '11' ) 
                .addChoice('Entertainment: Music',                                 '12' ) 
                .addChoice('Entertainment: Musicals &amp; Theatres',               '13' ) 
                .addChoice('Entertainment: Television',                            '14' ) 
                .addChoice('Entertainment: Video Games',                           '15' ) 
                .addChoice('Entertainment: Board Games',                           '16' ) 
                .addChoice('Science &amp; Nature',                                 '17' ) 
                .addChoice('Science: Computers',                                   '18' ) 
                .addChoice('Science: Mathematics',                                 '19' ) 
                .addChoice('Mythology',                                            '20' ) 
                .addChoice('Sports',                                               '21' ) 
                .addChoice('Geography',                                            '22' ) 
                .addChoice('History',                                              '23' ) 
                .addChoice('Politics',                                             '24' ) 
                .addChoice('Art',                                                  '25' ) 
                .addChoice('Celebrities',                                          '26' ) 
                .addChoice('Animals',                                              '27' ) 
                .addChoice('Vehicles',                                             '28' ) 
                .addChoice('Entertainment: Comics',                                '29' ) 
                .addChoice('Science: Gadgets',                                     '30' ) 
                .addChoice('Entertainment: Japanese Anime &amp; Manga',            '31' )
                )
        .addStringOption(option =>
            option.setName('difficulty')
                .setDescription('Select the Quiz difficulty')
                .setRequired(true)
                .addChoice('Any Difficulty',                          'any')
                .addChoice('Easy',                                    'easy') 
                .addChoice('Medium',                                  'medium') 
                .addChoice('Hard',                                    'hard')
                )
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Question type')
                .setRequired(true)
                .addChoice('Any Type',                                'any')
                .addChoice('Multiple Choice',                         'multiple') 
                .addChoice('True / False',                            'boolean') 
                )
            .addIntegerOption(option => option.setName('amount').setDescription('Question amount (Max 10)').setRequired(true))
            .addIntegerOption(option => option.setName('time').setDescription('Time in seconds per Question (Max 60)').setRequired(true)),
    async execute(interaction) {
        utils.start(interaction)
    }
};