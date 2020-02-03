import {expect} from 'chai'
import 'mocha'
import {SnowAlgae} from '../game/cards/SnowAlgae'
import {Game} from '../game/Game'
import {Tharsis, Board} from '../game/Board'
import {Player} from '../game/Player'
import {MockMessenger} from '../app/Messenger'
import {OceansEffect} from '../game/GlobalEffect'
import {InteractionRequest, PlaceHex, SplitPayment, ChooseUpTo, EnemySelection, ChooseAction} from '../game/InteractionRequest'
import {GiantIceAsteroid} from '../game/cards/GiantIceAsteroid'

describe('Card', () =>{
    let game: Game
    let board: Board
    let player: Player
    let enemy: Player
    let snowAlgae: SnowAlgae
    let gia: GiantIceAsteroid
    beforeEach(() =>{
        game = new Game()
        board = new Tharsis(game)
        enemy = new Player(game, new MockMessenger((request: InteractionRequest) => {
            throw Error('Enemy should not have any choice')
        }), {name: 'Damian'})
        player = new Player(game, new MockMessenger((request: InteractionRequest) => {
            if(request instanceof ChooseAction){
                return {playCard: 'snow algae', handNum: 0}
            }
            if(request instanceof PlaceHex){
                if(request.hexType === 'ocean'){
                    return [[3, 7], [1, 2], [4, 8]].slice(0, request.num)
                }
            }
            if(request instanceof SplitPayment){
                if(request.cost === 41){
                    return [['titanium', 2]]
                }
            }
            if(request instanceof ChooseUpTo){
                if(request.upTo === 12){
                    return 7
                }
            }
            if(request instanceof EnemySelection){
                return 1
            }
            throw Error('Unrecognized request')
        }), {name: 'Bartek'})
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
        it('should cost money to play', async (done) =>{
            player.cardsToBuy = [snowAlgae]
            player.changeResource('megacredit', 100)
            player.buy([snowAlgae])
            await player.play(snowAlgae)
            game.afterGame(() => {
                expect(player.getResource('megacredit')).to.equal(85)
                done()
            })
        })
        it('should be able to accept payment in resources', async (done) =>{
            player.cardsToBuy = [gia]
            player.changeResource('megacredit', 100)
            player.changeResource('titanium', 3)
            player.buy([gia])
            await player.play(gia)
            game.afterGame(() => {
                expect(player.getResource('megacredit')).to.equal(62)
                expect(player.getResource('titanium')).to.equal(1)
                done()
            })
        })
        it('should check requirement', () =>{
            player.cardsToBuy = [snowAlgae]
            player.changeResource('megacredit', 100)
            player.buy([snowAlgae])
            expect(player.canPlay(snowAlgae)).to.be.false
            player.globalEffect(new OceansEffect(2))
            expect(player.canPlay(snowAlgae)).to.be.true
        })
        it('should raise production', async (done) => {
            player.cardsToBuy = [snowAlgae]
            player.changeResource('megacredit', 100)
            player.buy([snowAlgae])
            expect(player.getProduction('heat')).to.equal(0)
            expect(player.getProduction('plant')).to.equal(0)
            await player.play(snowAlgae)
            game.afterGame(() => {
                expect(player.getProduction('heat')).to.equal(1)
                expect(player.getProduction('plant')).to.equal(1)
                done()
            })
        })
        it('should raise terraforming markers', async (done) =>{
            player.cardsToBuy = [gia]
            player.changeResource('megacredit', 100)
            player.buy([gia])
            await player.play(gia)
            game.afterGame(() => {
                expect(board.temperature.level).to.equal(-26)
                expect(board.oceans.level).to.equal(2)
                done()
            })
        })
    })
})
