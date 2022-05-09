/* global games, BONUS, round */
const leven = require('leven');
const GraphemeSplitter = require('grapheme-splitter');
const {
    getScore,
    wait,
    getHints,
} = require('./helpers');

const splitter = new GraphemeSplitter();
class Game {
    constructor(io, socket) {
        this.io = io;
        this.socket = socket;
    }

    chosenWord(playerID) {
        const { io } = this;
        return new Promise((resolve, reject) => {
            function rejection(err) { reject(err); }
            const socket = io.of('/').sockets.get(playerID);
            socket.on('chooseWord', ({ word }) => {
                socket.to(socket.roomID).emit('hideWord', { word: splitter.splitGraphemes(word).map((char) => (char !== ' ' ? '_' : char)).join('') });
                socket.removeListener('disconnect', rejection);
                resolve(word);
            });
            socket.once('disconnect', rejection);
        });
    }

    resetGuessedFlag(players) {
        const { io } = this;
        players.forEach((playerID) => {
            const player = io.of('/').sockets.get(playerID);
            if (player) player.hasGuessed = false;
        });
    }

    async startGame() {
        const { io, socket } = this;
        const { rounds } = games[socket.roomID];
        const players = Array.from(await io.in(socket.roomID).allSockets());
        io.to(socket.roomID).emit('endGame', { stats: games[socket.roomID] });
        delete games[socket.roomID];
    }

    onMessage(data) {
        const { io, socket } = this;
    }

    async getPlayers() {
        const { io, socket } = this;
        const players = Array.from(await io.in(socket.roomID).allSockets());
        io.in(socket.roomID).emit('getPlayers',
            players.reduce((acc, id) => {
                const { player } = io.of('/').sockets.get(id);
                acc.push(player);
                return acc;
            }, []));
    }
}

module.exports = Game;
