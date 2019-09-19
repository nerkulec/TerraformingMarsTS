import {expect} from 'chai';
import 'mocha';
import {SnowAlgae} from '../game/cards/SnowAlgae';
import {Game, GameCycle} from '../game/Game';
import {Tharsis} from '../game/Board';
import {Player} from '../game/Player';
import {MockMessenger} from '../client/Messenger';
import { OceansEffect } from '../game/GlobalEffect';

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
    it('should transfer to hand', () =>{
        let mock = prepare();
        let snowAlgae = new SnowAlgae();
        mock.player.cardsToBuy = [snowAlgae];
        mock.player.changeResource('megacredit', 100);
        mock.player.buy([snowAlgae]);
        expect(mock.player.hand).to.contain(snowAlgae);
        expect(mock.player.cardsToBuy).not.to.contain(snowAlgae);
    })
    it('should cost money to buy', () =>{
        let mock = prepare();
        let snowAlgae = new SnowAlgae();
        mock.player.cardsToBuy = [snowAlgae];
        mock.player.changeResource('megacredit', 100);
        mock.player.buy([snowAlgae]);
        expect(mock.player.getResource('megacredit')).to.equal(97);
    })
    it('should cost money to play', () =>{
        let mock = prepare();
        let snowAlgae = new SnowAlgae();
        mock.player.cardsToBuy = [snowAlgae];
        mock.player.changeResource('megacredit', 100);
        mock.player.buy([snowAlgae]);
        mock.game.extendGameCycle(mock.player.play(snowAlgae));
        mock.game.run();
        expect(mock.player.getResource('megacredit')).to.equal(85);
    })
    it('should check requirement', () =>{
        let mock = prepare();
        let snowAlgae = new SnowAlgae();
        mock.player.cardsToBuy = [snowAlgae];
        mock.player.changeResource('megacredit', 100);
        mock.player.buy([snowAlgae]);
        expect(mock.player.canPlay(snowAlgae)).to.be.false;
        mock.player.globalEffect(new OceansEffect(2));
        expect(mock.player.canPlay(snowAlgae)).to.be.true;
    })
    it('should raise production', () => {
        let mock = prepare();
        let snowAlgae = new SnowAlgae();
        mock.player.cardsToBuy = [snowAlgae];
        mock.player.changeResource('megacredit', 100);
        mock.player.buy([snowAlgae]);
        expect(mock.player.getProduction('heat')).to.equal(0);
        expect(mock.player.getProduction('plant')).to.equal(0);
        mock.game.extendGameCycle(mock.player.play(snowAlgae));
        mock.game.run();
        expect(mock.player.getProduction('heat')).to.equal(1);
        expect(mock.player.getProduction('plant')).to.equal(1);
    });
});
