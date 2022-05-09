const {
    Client,
    Intents,
    Collection
} = require('discord.js');
const {
    REST
} = require('@discordjs/rest');
const {
    Routes
} = require('discord-api-types/v9');
const fs = require('fs');
const config = require("./config.json");
const http = require("http");
const wait = require('node:timers/promises').setTimeout;
const utils = require("./utils/utils.js");
const { MessageEmbed } = require('discord.js');

const client = new Client({ intents: new Intents(32767) });

const TOKEN = config.BOT_TOKEN;


const api=config.API_URL;
const port=config.API_PORT;
const port_trivia=config.TRIVIA_API_PORT;
const hostname=config.API_HOSTNAME;

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));


const commands = [];

client.commands = new Collection();

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
}

client.on('ready', () => {
    const rest = new REST({ version: '9' }).setToken(config.BOT_TOKEN);

    (async () => {
        try {
            console.log('Started refreshing application (/) commands.');

            await rest.put(
                Routes.applicationCommands(config.BOT_ID),
                { body: commands },
            );

            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    })();
});



function postDeleteReply(interaction, msg) {
	return new Promise(resolve => {
        interaction.reply({ content: msg, ephemeral: false });  
		setTimeout(() => interaction.deleteReply(), 10000);
	});
}



client.on('interactionCreate', async interaction => {
    try{
        if (!interaction.isCommand() && !interaction.isButton()) return;
        if (interaction.isCommand()){        
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction);
            } catch (error) {
                if (error) console.error(error);
                await interaction.reply({ content: 'Error!', ephemeral: true });
            }
        } else if (interaction.isButton()){
            if(interaction.customId.startsWith('quickstart')){
                utils.start(interaction)
            } else if(interaction.customId.startsWith('reset')){
                utils.endAllQuiz(interaction, true)
            } else if(interaction.customId.startsWith('Quiz')){
                const splittedAnswer = interaction.customId.split('_');

                //const quizId = splittedAnswer[1];
                const questionId = splittedAnswer[2];
                const answerId = splittedAnswer[3];

                const options = {
                    "method": "GET",
                    "hostname": hostname,
                    "port": port_trivia,
                    "path": '/user/saveanswer?questionid='+questionId
                        +'&answerid='+answerId
                        +'&userid='+interaction.member.user.id
                        +'&username='+interaction.member.user.username
                }

                const req = http.request(options, function(res) {

                    req.on('error', function (error) {
                        console.log(error);
                        interaction.reply({ content: 'Error', ephemeral: true }); 
                    });
                    var chunks = [];     
                
                    res.on("data", function (chunk) {
                        chunks.push(chunk);
                    });   
                
                    res.on("end", function() {
            
                        try {
                            if ( this.statusCode === 200 ) { 
                                var object = JSON.parse(chunks);
                                if(object.UserAnswers_id !== null && object.UserAnswers_id !== undefined && object.UserAnswers_id !== 0){

                                    var msg = "Answer saved!";

                                    for(var i = 0; i < interaction.message.components[0].components.length; i++) {
                                        var button = interaction.message.components[0].components[i];
                                        if ( button.customId === interaction.customId ) {
                                            msg = interaction.member.user.username + ' answered "' + button.label + '"';
                                            break;
                                        }

                                    }
                                    
                                    postDeleteReply(interaction, msg);

                                } else {
                                    interaction.reply({ content: 'Error', ephemeral: true });
                                }
                            } else if ( this.statusCode === 400 ) {
                                interaction.reply({ content: "You already answered that question!", ephemeral: true });
                            } else {
                                interaction.reply({ content: 'Error', ephemeral: true });
                            }
                             
                        } catch (error) {
                            interaction.reply({ content: 'Error', ephemeral: true });
                            console.error(error);
                        }
                        
                    });
                
                });         
                
                req.end()
            } else if (interaction.customId.startsWith('DisplayResults')) {

                const splittedAnswer = interaction.customId.split('_');
                const quizid = splittedAnswer[1];

                const options = {
                    "method": "GET",
                    "hostname": hostname,
                    "port": port_trivia,
                    "path": '/user/getresults?quiz_id='+quizid+'&guild_id='+interaction.member.guild.id+'&user_id='+interaction.member.user.id
                }
            
                const req = http.request(options, function(res) {
                    
                    req.on('error', function (error) {
                        console.log(error);
                        interaction.reply({ content: 'Error', ephemeral: true }); 

                        endAllQuiz(interaction, false)
                    });
                    var chunks = [];     
                
                    res.on("data", function (chunk) {
                        chunks.push(chunk);
                    });
                
                    res.on("end", function() {
                        
                        var object = JSON.parse(chunks);
                        var points = 0;
                        
                        var endingEmbed = new MessageEmbed()

                        for (var i = 0; i < object.length; i++) {
                            var results = object[i];
                            var is_correct = "WRONG:  ";
                            var correct = "";
                            if (results.is_correct === 1) {
                                is_correct = "RIGHT:  ";
                                points = points + 1;
                            } else {
                                for (var z = 0; z < results.all_answers.length; z ++) {
                                    int_answers = results.all_answers[z];
                                    if ( int_answers.is_correct === 1 ) {
                                        correct = ".   CORRECT ONE WAS: " + int_answers.answer
                                    }
                                }
                            }
                            endingEmbed.addField(results.question, is_correct+"  " + results.answer + correct, false)
                        }

                        

                        endingEmbed
                        .setColor('#0099ff')
                        .setTitle("Your results!") 
                        .setDescription("You scored " + points + " points."); 


                        endingEmbed.setFooter({ text: "Creato da " + interaction.member.user.username, iconURL: interaction.member.user.displayAvatarURL() });   

                        interaction.reply({ content: "Quiz ended.", embeds: [endingEmbed], components: [], ephemeral: true });
            
                        try {
                            if ( this.statusCode === 400 ) {
                                interaction.reply({ content: 'Error', ephemeral: true });
                            }
                        } catch (error) {
                            interaction.reply({ content: 'Error', ephemeral: true });
                            console.error(error);
                        }
                        
                    });
                
                });         
                
                req.end()
            }
        }
    } catch (error) {
        await interaction.reply({ content: 'Error', ephemeral: true });
        console.error(error);
    }
});
client.login(TOKEN);
