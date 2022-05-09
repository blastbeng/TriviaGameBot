const config = require("../config.json");
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const http = require("http");

const port_trivia=config.TRIVIA_API_PORT;
const hostname=config.API_HOSTNAME;


module.exports = {
    start: function(interaction) {
      const options = {
        "method": "GET",
        "hostname": hostname,
        "port": port_trivia,
        "path": '/quiz/running?is_running=1&guild_id='+interaction.member.guild.id
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
                  var object = JSON.parse(chunks);       
                  if (object.length !== 0 ) {
                      interaction.reply({ content: "There is a Quiz already in progress!", ephemeral: true });
                  } else {
                    var path = '/quiz/create?author='+encodeURIComponent(interaction.member.user.username)
                      +'&author_id='+interaction.member.user.id
                      +'&guild_id='+interaction.member.guild.id

                    var timeleft = 0;
                    var amount = 0;
                    if ((interaction.customId !== undefined && interaction.customId.startsWith('quickstart'))
                        || (interaction.commandName !== undefined && interaction.commandName.startsWith('quickstart'))) {
                      var timeleft = 30000;
                      var amount = 5;
                            
                      path = path +'&amount='+amount

                    } else if ((interaction.customId !== undefined && interaction.customId.startsWith('start'))
                        || (interaction.commandName !== undefined && interaction.commandName.startsWith('start'))) {
                      const category = interaction.options.getString('category');
                      const difficulty = interaction.options.getString('difficulty');
                      const type = interaction.options.getString('type');
                      amount = interaction.options.getInteger('amount');
                      timeleft = interaction.options.getInteger('time');

                      if(amount > 10) {
                          interaction.reply({ content: 'Error! Question amount must be < 10', ephemeral: true }); 
                          return
                      } else if (amount <= 0) {
                          interaction.reply({ content: 'Error! Question amount must be > 0', ephemeral: true }); 
                          return
                      } else {
                        path = path +'&amount='+amount
                      }

                      if(timeleft < 5) {
                          interaction.reply({ content: 'Error! Time must be > 5', ephemeral: true }); 
                          return
                      } else if (timeleft > 60) {
                          interaction.reply({ content: 'Error! Time must be < 60', ephemeral: true });  
                          return                           
                      } else {
                          timeleft = timeleft*1000;
                      }

                      if(category!=="any") {
                          path = path+'&category='+encodeURIComponent(category)
                      }

                      if(difficulty!=="any") {
                          path = path+'&difficulty='+encodeURIComponent(difficulty)
                      }

                      if(type!=="any") {
                          path = path+'&type='+encodeURIComponent(type)
                      }
                      
                    } else {
                      interaction.reply({ content: 'Error', ephemeral: true }); 
                      return
                    }

                      const options = {
                          "method": "GET",
                          "hostname": hostname,
                          "port": port_trivia,
                          "path": path
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
                  
                              try {
                                  var object = JSON.parse(chunks);

                                  var quizid = object.Quiz_id;
                                  
                                  var questionNumber = 1;

                                  getQuestion(quizid, interaction, questionNumber, timeleft, false);
                                  
                              } catch (error) {
                                  if ( interaction.replied ) {
                                      interaction.editReply({ content: 'Error', ephemeral: true });
                                  } else {
                                      interaction.reply({ content: 'Error', ephemeral: true });
                                  }
                                  console.error(error);

                                  endAllQuiz(interaction, false)
                              }
                              
                          });
                      
                      });         
                      
                      req.end()
                  
                      
                  }    
              } catch (error) {
                  interaction.reply({ content: 'Error', ephemeral: true });
                  console.error(error);

                  endAllQuiz(interaction, false)
              }
              
          });
      
      });         
      
      req.end()
                  
      
    },
    endAllQuiz: function (interaction, reply) {
      endAllQuiz(interaction,reply)
    }
  };

  function endAllQuiz(interaction, reply) {
    

    const options = {
      "method": "GET",
      "hostname": hostname,
      "port": port_trivia,
      "path": '/quiz/endall?guild_id='+interaction.member.guild.id
    }

    const req = http.request(options, function(res) {
        
        req.on('error', function (error) {
            console.log(error);
        });
        var chunks = [];     
    
        res.on("data", function (chunk) {
            chunks.push(chunk);
        });
    
        res.on("end", function() {
          if ( this.statusCode === 400 ) {
            console.error("Quiz not ended, status code: " + this.statusCode);
            if (reply) {
              interaction.reply({ content: 'Reset Error!', ephemeral: true }); 
            }
          } else {
            if (reply) {
              interaction.reply({ content: 'Reset Done.', ephemeral: true }); 
            }
          }
            
        });
    
    });         
    
    req.end()
  }

  function getQuestion(quizid, interaction, questionNumber, input_timeleft, ended) {

    const options = {
        "method": "GET",
        "hostname": hostname,
        "port": port_trivia,
        "path": '/questions/get?number='+questionNumber+'&quiz_id='+quizid
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

            try {

                var object = JSON.parse(chunks);

                if ( ended ) {

                    const options = {
                        "method": "GET",
                        "hostname": hostname,
                        "port": port_trivia,
                        "path": '/quiz/end?quiz_id='+quizid+'&guild_id='+interaction.member.guild.id
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

                            var endingEmbed = new MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle("Quiz Ended!") 
                            .setDescription("Here are the results of the quiz"); 
                            
                            

                            var i = 0;
                            for (var key in object) {
                                if ( i == 24 ) break;
                                endingEmbed.addField(key + " " + object[key], '\u200B', false)
                                i++;
                            }
                            
                            var rowUserResults = new MessageActionRow();
                            rowUserResults.addComponents(
                                new MessageButton()
                                    .setCustomId('DisplayResults_'+quizid)
                                    .setLabel("Display your results")
                                    .setStyle('PRIMARY'),
                            );

                            endingEmbed.setFooter({ text: "Creato da " + interaction.member.user.username, iconURL: interaction.member.user.displayAvatarURL() });   

                            if ( interaction.replied ) {
                                interaction.editReply({ content: "Quiz ended.", embeds: [endingEmbed], components: [rowUserResults], ephemeral: false }); 
                            } else {
                                interaction.reply({ content: "Quiz ended.", embeds: [endingEmbed], components: [rowUserResults], ephemeral: false });
                            }
                
                            try {
                                if ( this.statusCode === 400 ) {
                                    if ( interaction.replied ) {
                                        interaction.editReply({ content: 'Error', ephemeral: true });
                                    } else {
                                        interaction.reply({ content: 'Error', ephemeral: true });
                                    }

                                    endAllQuiz(interaction, false)
                                }
                            } catch (error) {
                                if ( interaction.replied ) {
                                    interaction.editReply({ content: 'Error', ephemeral: true });
                                } else {
                                    interaction.reply({ content: 'Error', ephemeral: true });
                                }
                                console.error(error);

                                endAllQuiz(interaction, false)
                            }
                            
                        });
                    
                    });         
                    
                    req.end()

                } else {

                    var rowAnswers = new MessageActionRow();

                    var correctId = "";

                    for (var i = 0; i < object.answers.length && i < 25; i++) {
                        var answer = object.answers[i];
                        rowAnswers.addComponents(
                            new MessageButton()
                                .setCustomId('Quiz_'+quizid+'_'+object.id+'_'+answer.id)
                                .setLabel(answer.answer)
                                .setStyle('PRIMARY'),
                        );

                        if (answer.is_correct === 1) {
                            correctId = answer.id+"";
                        }
                     }
                    var quiz_title = "";
                    if (questionNumber === 1) {
                        quiz_title = interaction.member.user.username +" started a Quiz!";
                    } else {
                        quiz_title = "Quiz running... ";
                    }
                    const question_title = "Question N° " + object.number + "!";

                    var timeleft = input_timeleft;

                    var embed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(question_title) 
                        .setDescription(object.question);
                        
                    embed.setFooter({ text: "Time left: " + (timeleft/1000), iconURL: interaction.member.user.displayAvatarURL() });

                    if ( interaction.replied ) {
                        interaction.editReply({ content: quiz_title, ephemeral: false, embeds: [embed], components: [rowAnswers] }); 
                    } else {
                        interaction.reply({ content: quiz_title, ephemeral: false, embeds: [embed], components: [rowAnswers] }); 
                    }
                    
                    questionNumber = questionNumber + 1;

                    if(object.is_last === 1) {
                        ended = true;
                    }

                    displayQuestions(quiz_title, interaction, embed, rowAnswers, quizid, questionNumber, input_timeleft, ended, correctId);
                }

            } catch (error) {
                if ( interaction.replied ) {
                    interaction.editReply({ content: 'Error', ephemeral: true });
                } else {
                    interaction.reply({ content: 'Error', ephemeral: true });
                }
                console.error(error);

                endAllQuiz(interaction, false)
            }
            
        });
    
    });         
    
    req.end()
}

function displayQuestions(quiz_title, interaction, embed, rowAnswers, quizid, questionNumber, input_timeleft, ended, correctId) {
    return new Promise((resolve, reject) => {
        var timeleft = input_timeleft;
        var refreshId = setInterval(() => {
            timeleft -= 1000;                                        
            if (timeleft < 0) {
                for(var i = 0; i < rowAnswers.components.length; i++){
                    rowAnswers.components[i].disabled = true;
                }
                clearInterval(refreshId);
                timeleft = 0;
                waitNextQuestion(quiz_title, interaction, embed, rowAnswers, quizid, questionNumber, input_timeleft, ended, correctId);

            } else {
                embed.setFooter({ text: "Time left: " + (timeleft/1000), iconURL: interaction.member.user.displayAvatarURL() });
                interaction.editReply({ content: quiz_title, ephemeral: false, embeds: [embed], components: [rowAnswers] }); 
            }

        }, 1000);
    });
}



function displayCorrectAnswer(quiz_title, interaction, embed, rowAnswers, quizid, questionNumber, input_timeleft, ended, correctId) {
    return new Promise((resolve, reject) => {
        var timeleft = 6000;
        var refreshId = setInterval(() => {
            timeleft -= 1000;                                        
            if (timeleft < 0) {
                for(var i = 0; i < rowAnswers.components.length; i++){
                    rowAnswers.components[i].disabled = true;
                }
                clearInterval(refreshId);
                timeleft = 0;
                waitNextQuestion(quiz_title, interaction, embed, rowAnswers, quizid, questionNumber, input_timeleft, ended, correctId);

            } else {

                for(var i = 0; i < rowAnswers.components.length; i++) {
                    rowAnswers.components[i].disabled = true;
                }

                embed.setFooter({ text: "Time is out! Correct one was ... " + (timeleft/1000) + " ... ", iconURL: interaction.member.user.displayAvatarURL() });
                interaction.editReply({ content: quiz_title, ephemeral: false, embeds: [embed], components: [rowAnswers] }); 
            }

        }, 1000);
    });
}

function waitNextQuestion(quiz_title, interaction, embed, rowAnswers, quizid, questionNumber, input_timeleft, ended, correctId) {
    return new Promise((resolve, reject) => {
        var timeleft = 11000;
        var refreshId = setInterval(() => {
            timeleft -= 1000;                                        
            if (timeleft < 0) {
                clearInterval(refreshId);
                timeleft = 0;
                getQuestion(quizid, interaction, questionNumber, input_timeleft, ended, correctId);

            } else {
                for(var i = 0; i < rowAnswers.components.length; i++) {
                    rowAnswers.components[i].disabled = true;
                    
                    const answerId = rowAnswers.components[i].customId.split('_')[3];
                    
                    if ( answerId === correctId ) {
                        rowAnswers.components[i].style = 'SUCCESS';
                    } else {
                        rowAnswers.components[i].style = 'DANGER';
                    }

                }

                if (ended){
                    embed.setFooter({ text: "Quiz ended! Results in " + (timeleft/1000) + " ... ", iconURL: interaction.member.user.displayAvatarURL() });
                    interaction.editReply({ content: quiz_title, ephemeral: false, embeds: [embed], components: [rowAnswers] }); 
                } else {

                    embed.setFooter({ text: "Time is out! Next Question in " + (timeleft/1000) + " ... ", iconURL: interaction.member.user.displayAvatarURL() });
                    interaction.editReply({ content: quiz_title, ephemeral: false, embeds: [embed], components: [rowAnswers] }); 
                }
            }

        }, 1000);
    });
}