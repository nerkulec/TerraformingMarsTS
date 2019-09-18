import {expect} from 'chai';
import 'mocha';
import {SnowAlgae} from '../game/cards/SnowAlgae';
import {Game, GameCycle} from '../game/Game';
import {Tharsis} from '../game/Board';
import {Player} from '../game/Player';
import {MockMessenger} from '../client/Messenger';
import {chain} from '../game/Utils';
import {ActionRequest, ActionResponse} from '../game/ActionRequest';

function prepare(){
    let game = new Game();
    let board = new Tharsis(game);
    let player = new Player(game, new MockMessenger((info) => {
        return {'string': 'mock-game', 'resources': []};
    }))
    game.addPlayer(player);
    game.startGameCycle();
    return {
        'game':game,
        'board':board,
        'player':player
    }
}

describe('Basic card', () => {
    it('should raise heat and plant production', () => {
        let mock = prepare();
        let snowAlgae = new SnowAlgae();
        mock['player'].cardsToBuy = [snowAlgae];
        mock['player'].changeResource('megacredit', 100);
        mock['player'].buy([snowAlgae]);
        expect(mock['player'].getProduction('heat')).to.equal(0);
        expect(mock['player'].getProduction('plant')).to.equal(0);
        mock['game'].extendGameCycle(mock['player'].play(snowAlgae));
        mock['game'].run();
        expect(mock['player'].getProduction('heat')).to.equal(1);
        expect(mock['player'].getProduction('plant')).to.equal(1);
    });
});