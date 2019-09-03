class Game{
    deck: Card[] = cardsList.slice();
    discardedCards: Card[] = [];

    constructor(){
        shuffle(this.deck);
    }

    draw = (n: number): Card[] => {
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
}