import {expect} from 'chai';
import 'mocha';
import {SnowAlgae} from '../game/cards/SnowAlgae';
import {Game, GameCycle} from '../game/Game';
import {Tharsis} from '../game/Board';
import {Player} from '../game/Player';
import {MockMessenger} from '../client/Messenger';
import { OceansEffect } from '../game/GlobalEffect';
import { OceansRequirement } from '../game/Requirement';
import { StringResponse, ActionRequest } from '../game/ActionRequest';

function prepare(){
    let game = new Game();
    let board = new Tharsis(game);
    let player = new Player(game, new MockMessenger((request: ActionRequest) => {
        if(request.type === 'ChooseName'){
            return new StringResponse('mock-name');
        }
        throw Error('Unrecognized request');
    }))
    game.addPlayer(player);
    game.startGameCycle();
    return {
        'game':game,
        'board':board,
        'player':player
    }
}
describe('Card.hasTag', () =>{
    it('should recognize tag', () =>{
        let snowAlgae = new SnowAlgae();
        expect(snowAlgae.hasTag('plant')).to.be.true;
        expect(snowAlgae.hasTag('space')).to.be.false;
        expect(snowAlgae.hasTag('earth')).to.be.false;
    })
})
describe('Card.playable', () =>{
    it('should recognize lack of money', () =>{
        let mock = prepare();
        let snowAlgae = new SnowAlgae();
        mock.player.globalEffect(new OceansEffect(2));
        expect(mock.player.canPlay(snowAlgae)).to.be.false;
        mock.player.changeResource('megacredit', 12);
        expect(mock.player.canPlay(snowAlgae)).to.be.true;
    })
    it('should recognize unsatisfied requirements', () =>{
        let mock = prepare();
        let snowAlgae = new SnowAlgae();
        mock.player.changeResource('megacredit', 12);
        expect(mock.player.canPlay(snowAlgae)).to.be.false;
        mock.player.globalEffect(new OceansEffect(2));
        expect(mock.player.canPlay(snowAlgae)).to.be.true;
    })
})
describe('Card.buy', () => {
    it('should transfer card to hand', () =>{
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
});
describe('Card.play', () =>{
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
