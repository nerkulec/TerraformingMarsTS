import {Player, Color} from './Player'
import {Card} from './Card'
import {shuffle, roll, remove} from './Utils'
import {Board} from './Board'
import {InteractionRequest, ChooseColor, ChooseAction} from './InteractionRequest'
import {cardsList} from './CardsList'

export class Game{
    name!: string

    deck: Card[] = cardsList.slice()
    discardedCards: Card[] = []

    board!: Board
    players: Player[] = []

    generation: number = 1

    finished: boolean = false
    afterGameCallback?: () => void

    constructor(){
        shuffle(this.deck)
    }
    
    addPlayer(player: Player): void{
        this.players.push(player)
    }

    draw(n: number): Card[] {
        let cards: Card[] = []
        let amount: number = Math.min(n, this.deck.length)
        cards = this.deck.splice(this.deck.length-amount, amount)
        if(amount < n){
            this.deck = this.discardedCards
            shuffle(this.deck)
            this.discardedCards = []
            let rest: number = n - amount
            cards = cards.concat(this.deck.splice(this.deck.length-rest, rest))
        }
        return cards
    }

    async setColors(){
        let players = this.players.slice()
        let colors: Color[] = ['blue', 'green', 'yellow', 'red', 'gray']
        for(let i=0; i<players.length; i++){
            let promises = []
            for(const player of players){
                promises.push(player.request(new ChooseColor(player, colors)))
            }
            const choice = await Promise.race(promises)
            choice.player.color = choice.color
            remove(players, choice.player)
            remove(colors, choice.color)
        }
    }

    async start(){
        await this.setColors()
        let players = this.players.slice()
        shuffle(players)
        // TODO: setup

        while(!this.finished){
            let roundPlayers = players.slice()
            for(const player of roundPlayers){
                let action = await player.request(new ChooseAction(player))
                if(action==='pass'){
                    remove(roundPlayers, player)
                    continue
                }else{
                    await player.execute(action)
                }
                action = await player.request(new ChooseAction(player, true))
                if(action==='pass'){
                    continue
                }else{
                    await player.execute(action)
                }
            }
            roll(players)
        }

        if(this.afterGameCallback){
            this.afterGameCallback()
        }
    }

    afterGame(callback: () => void){
        this.afterGameCallback = callback
    }
}