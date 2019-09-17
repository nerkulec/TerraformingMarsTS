type GameCycle = Generator<ActionRequest, void, ActionResponse>;

class Game{
    name!: string;
    terminated: boolean = false;

    deck: Card[] = cardsList.slice();
    discardedCards: Card[] = [];

    players: Player[] = [];

    constructor(){
        shuffle(this.deck);
    }

    draw(n: number): Card[] {
        let cards: Card[] = [];
        let amount: number = Math.min(n, this.deck.length);
        cards = this.deck.splice(this.deck.length-amount, amount);
        if(amount < n){
            this.deck = this.discardedCards;
            shuffle(this.deck);
            this.discardedCards = [];
            let rest: number = n - amount;
            cards = cards.concat(this.deck.splice(this.deck.length-rest, rest));
        }
        return cards;
    }

    * getGameCycle(): GameCycle{
        let activePlayer = this.players[0];
        let response: ActionResponse = yield new ChooseName(activePlayer);
        this.name = response.string;
    }

    start(){
        let cycle = this.getGameCycle();
        let firstRequest = cycle.next().value;
        if(firstRequest !== undefined){
            firstRequest.player.request(firstRequest, cycle);
        }
    }
}