import {expect} from 'chai'
import 'mocha'
import {SnowAlgae} from '../game/cards/SnowAlgae'
import {Game} from '../game/Game'
import {Tharsis, Board} from '../game/Board'
import {MockPlayer} from '../game/Player'
import {MockMessenger} from '../app/Messenger'
import {OceansEffect} from '../game/GlobalEffect'
import {GiantIceAsteroid} from '../game/cards/GiantIceAsteroid'

describe('Card', () =>{
    let game: Game
    let board: Board
    let player: MockPlayer
    let enemy: MockPlayer
    let snowAlgae: SnowAlgae
    let gia: GiantIceAsteroid
    beforeEach(() =>{
        game = new Game()
        board = new Tharsis(game)
        enemy = new MockPlayer(game, new MockMessenger(), {name: 'bartek'})
        player = new MockPlayer(game, new MockMessenger(), {name: 'damian'})
        //     if(request instanceof SplitPayment){
        //         if(request.cost === 41){
        //             return [['titanium', 2]]
        //         }
        //     }
        //     if(request instanceof ChooseUpTo){
        //         if(request.upTo === 12){
        //             return 7
        //         }
        //     }
        //     if(request instanceof EnemySelection){
        //         return 1
        //     }
        //     throw Error('Unrecognized request')
        // }), {name: 'Bartek'})
        player.messenger.addResponse('ChooseColor', {color: 'green'})
        enemy.messenger.addResponse('ChooseColor', {color: 'red'})
        enemy.messenger.addResponse('ChooseAction', 'end')
        game.addPlayer(player)
        game.addPlayer(enemy)
        snowAlgae = new SnowAlgae()
        gia = new GiantIceAsteroid()
    })

    describe('.hasTag', () =>{
        it('should recognize tag', () =>{
            expect(snowAlgae.hasTag('plant')).to.be.true
            expect(snowAlgae.hasTag('space')).to.be.false
            expect(snowAlgae.hasTag('earth')).to.be.false
            expect(gia.hasTag('space')).to.be.true
            expect(gia.hasTag('event')).to.be.true
            expect(gia.hasTag('plant')).to.be.false
        })
    })
    describe('.playable', () =>{
        it('should recognize lack of money', () =>{
            player.globalEffect(new OceansEffect(2))
            expect(player.canPlay(snowAlgae)).to.be.false
            player.changeResource('megacredit', 12)
            expect(player.canPlay(snowAlgae)).to.be.true
        })
        it('should take into account availible resources', () =>{
            expect(player.canPlay(gia)).to.be.false
            player.changeResource('titanium', 2)
            expect(player.canPlay(gia)).to.be.false
            player.changeResource('megacredit', 35)
            expect(player.canPlay(gia)).to.be.true

        })
        it('should recognize unsatisfied requirements', () =>{
            player.changeResource('megacredit', 12)
            expect(player.canPlay(snowAlgae)).to.be.false
            player.globalEffect(new OceansEffect(2))
            expect(player.canPlay(snowAlgae)).to.be.true
        })
    })
    describe('.buy', () => {
        it('should transfer card to hand', () =>{
            player.cardsToBuy = [snowAlgae, gia]
            player.changeResource('megacredit', 100)
            player.buy([snowAlgae])
            expect(player.hand).to.contain(snowAlgae)
            expect(player.cardsToBuy).not.to.contain(snowAlgae)
        })
        it('should cost money to buy', () =>{
            player.cardsToBuy = [snowAlgae]
            player.changeResource('megacredit', 100)
            player.buy([snowAlgae])
            expect(player.getResource('megacredit')).to.equal(97)
        })
    })
    describe('.play', () =>{
        it('should cost money to play', async () =>{
            player.cardsToBuy = [snowAlgae]
            player.changeResource('megacredit', 100)
            player.buy([snowAlgae])
            player.globalEffect(new OceansEffect(2))
            player.messenger.addResponses('ChooseAction', [{handNum: 0}, 'pass'])
            await game.start()
            expect(player.getResource('megacredit')).to.equal(85)
        })
        it('should be able to accept payment in resources', async () =>{
            player.cardsToBuy = [gia]
            player.changeResource('megacredit', 100)
            player.changeResource('titanium', 3)
            player.buy([gia])
            player.messenger.addResponses('ChooseAction', [{handNum: 0}, 'pass'])
            player.messenger.addResponse('SplitPayment', [['titanium', 2]])
            player.messenger.addResponse('PlaceHex', [[1,2],[3,4]])
            player.messenger.addResponse('EnemySelection', 1)            
            await game.start()
            expect(player.getResource('megacredit')).to.equal(62)
            expect(player.getResource('titanium')).to.equal(1)
        })
        it('should check requirement', () =>{
            player.cardsToBuy = [snowAlgae]
            player.changeResource('megacredit', 100)
            player.buy([snowAlgae])
            expect(player.canPlay(snowAlgae)).to.be.false
            player.globalEffect(new OceansEffect(2))
            expect(player.canPlay(snowAlgae)).to.be.true
        })
        it('should raise production', async () => {
            player.cardsToBuy = [snowAlgae]
            player.changeResource('megacredit', 100)
            player.buy([snowAlgae])
            player.globalEffect(new OceansEffect(2))
            expect(player.getProduction('heat')).to.equal(0)
            expect(player.getProduction('plant')).to.equal(0)
            player.messenger.addResponses('ChooseAction', [{handNum: 0}, 'pass'])
            await game.start()
            expect(player.getProduction('heat')).to.equal(1)
            expect(player.getProduction('plant')).to.equal(1)
        })
        it('should raise terraforming markers', async () =>{
            player.cardsToBuy = [gia]
            player.changeResource('megacredit', 100)
            player.buy([gia])
            player.messenger.addResponses('ChooseAction', [{handNum: 0}, 'pass'])
            player.messenger.addResponse('SplitPayment', [['titanium', 2]])
            player.messenger.addResponse('PlaceHex', [[1,2],[3,4]])
            player.messenger.addResponse('EnemySelection', 1)
            await game.start()
            expect(board.temperature.level).to.equal(-26)
            expect(board.oceans.level).to.equal(2)
        })
    })
})
