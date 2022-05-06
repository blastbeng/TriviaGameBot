const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require("../utils/utils.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('quickstart')
        .setDescription('Quick Quiz. 5 Questions, 30 seconds.'),
    async execute(interaction) {
        utils.start(interaction)
    }
};
