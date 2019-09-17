import {expect} from 'chai';
import 'mocha';
import { Socket } from 'socket.io';

function prepare(){
    let game = new Game();
    let board = new Tharsis(game);
    let player = new Player(game, new MockMessenger((info) => {
        return {'string': 'placeOcean', 'resources': []};
    }))
    game.start();
    let gameCycle = game.getGameCycle();
    return {
        'game':game,
        'board':board,
        'player':player,
        'gameCycle':gameCycle
    }
}

describe('Basic card', () => {
    it('should raise heat and plant production', () => {
        let mock = prepare();
        let snowAlgae = new SnowAlgae();
        expect(mock['player'].production.get('heat')).to.equal(0);
        expect(mock['player'].production.get('plant')).to.equal(0);
        snowAlgae.play(mock['player'], mock['board'], mock['gameCycle']);
        expect(mock['player'].production.get('heat')).to.equal(1);
        expect(mock['player'].production.get('plant')).to.equal(1);
    });
});