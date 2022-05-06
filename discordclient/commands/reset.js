const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require("../utils/utils.js");

const config = require("../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Reset the Bot, in case you cannot start a Quiz anymore.'),
    async execute(interaction) {

        utils.endAllQuiz(interaction , true)
    }
};