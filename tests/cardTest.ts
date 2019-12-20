import {expect} from 'chai';
import 'mocha';
import {SnowAlgae} from '../game/cards/SnowAlgae';
import {Game} from '../game/Game';
import {Tharsis} from '../game/Board';
import {Player} from '../game/Player';
import {MockMessenger} from '../client/Messenger';
import {OceansEffect} from '../game/GlobalEffect';
import {StringResponse, ActionRequest, PlaceHex, ChooseName, PlaceResponse, SplitPayment, ResourcesResponse, ChooseUpTo, NumberResponse, EnemySelection, PlayerResponse} from '../game/ActionRequest';
import {Place} from '../game/Hex';
import {Resource} from '../game/Resource';
import {GiantIceAsteroid} from '../game/cards/GiantIceAsteroid';

function prepare(){
    let game = new Game();
    let board = new Tharsis(game);
    let enemy = new Player(game, new MockMessenger((request: ActionRequest) => {
        throw Error('Enemy should not have any choice')
    }));
    let player = new Player(game, new MockMessenger((request: ActionRequest) => {
        if(request instanceof ChooseName){
            return new StringResponse('mock-name');
        }
        if(request instanceof PlaceHex){
            if(request.hexType === 'ocean'){
                return new PlaceResponse([new Place(3, 7), new Place(1, 2), new Place(4, 8)].slice(0, request.num));
            }
        }
        if(request instanceof SplitPayment){
            if(request.cost === 41){
                return new ResourcesResponse([new Resource('titanium', 2)])
            }
        }
        if(request instanceof ChooseUpTo){
            if(request.upTo === 12){
                return new NumberResponse(7);
            }
        }
        if(request instanceof EnemySelection){
            return new PlayerResponse(enemy);
        }
        throw Error('Unrecognized request');
    }));
    game.addPlayer(player);
    game.startGameCycle();
    return {
        game: game,
        board: board,
        player: player,
        enemy: enemy
    }
}
describe('Card.hasTag', () =>{
    it('should recognize tag', () =>{
        let snowAlgae = new SnowAlgae();
        let gia = new GiantIceAsteroid();
        expect(snowAlgae.hasTag('plant')).to.be.true;
        expect(snowAlgae.hasTag('space')).to.be.false;
        expect(snowAlgae.hasTag('earth')).to.be.false;
        expect(gia.hasTag('space')).to.be.true;
        expect(gia.hasTag('event')).to.be.true;
        expect(gia.hasTag('plant')).to.be.false;
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
    it('should take into account availible resources', () =>{
        let mock = prepare();
        let gia = new GiantIceAsteroid();
        expect(mock.player.canPlay(gia)).to.be.false;
        mock.player.changeResource('titanium', 2);
        expect(mock.player.canPlay(gia)).to.be.false;
        mock.player.changeResource('megacredit', 35);
        expect(mock.player.canPlay(gia)).to.be.true;

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
        let gia = new GiantIceAsteroid();
        mock.player.cardsToBuy = [snowAlgae, gia];
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
    it('should be able to accept payment in resources', () =>{
        let mock = prepare();
        let gia = new GiantIceAsteroid();
        mock.player.cardsToBuy = [gia];
        mock.player.changeResource('megacredit', 100);
        mock.player.changeResource('titanium', 3);
        mock.player.buy([gia]);
        mock.game.extendGameCycle(mock.player.play(gia));
        mock.game.run();
        expect(mock.player.getResource('megacredit')).to.equal(62);
        expect(mock.player.getResource('titanium')).to.equal(1);
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
    })
    it('should raise terraforming markers', () =>{
        let mock = prepare();
        let gia = new GiantIceAsteroid();
        mock.player.cardsToBuy = [gia];
        mock.player.changeResource('megacredit', 100);
        mock.player.buy([gia]);
        mock.game.extendGameCycle(mock.player.play(gia));
        mock.game.run();
        expect(mock.board.temperature.level).to.equal(-26);
        expect(mock.board.oceans.level).to.equal(2);
        mock.game.run();
    })
});
