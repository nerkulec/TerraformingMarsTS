import {Player} from './Player'
import {Card} from './Card'
import {shuffle} from './Utils'
import {Board} from './Board'
import {InteractionRequest, ChooseName} from './InteractionRequest'
import {cardsList} from './CardsList'

export class Game{
    name!: string
    terminated: boolean = false

    deck: Card[] = cardsList.slice()
    discardedCards: Card[] = []

    board!: Board
    players: Player[] = []

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

    afterGame(callback: () => void){
        this.afterGameCallback = callback
    }
}