import {Player} from './Player';
import {Card} from './Card';
import {shuffle, chain, ensure} from './Utils';
import {Board} from './Board';
import {ActionRequest, ActionResponse, ChooseName, StringResponse} from './ActionRequest';
import {cardsList} from './CardsList';

export type GameCycle = Generator<ActionRequest, void, ActionResponse>;

export class Game{
    name!: string;
    cycle!: GameCycle;
    terminated: boolean = false;

    deck: Card[] = cardsList.slice();
    discardedCards: Card[] = [];

    board!: Board;
    players: Player[] = [];

    finished: boolean = false;
    afterGameCallback?: () => void;

    constructor(){
        shuffle(this.deck);
    }
    
    addPlayer(player: Player): void{
        this.players.push(player);
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
        this.name = ensure(response, StringResponse).str;
    }

    startGameCycle(): void{
        this.cycle = this.getGameCycle();
    }

    extendGameCycle(cycle: GameCycle): void{
        this.cycle = chain(this.cycle, cycle);
    }

    afterGame(callback: () => void){
        this.afterGameCallback = callback;
    }

    start(){
        this.startGameCycle();
        this.run();
    }

    run(){
        let firstRequest = this.cycle.next().value;
        if(firstRequest !== undefined){
            this.request(firstRequest);
        }
    }

    request(request: ActionRequest){
        request.player.messenger.request(request, (response: ActionResponse) => {
            let nextRequest = this.cycle.next(response).value;
            if(nextRequest !== undefined){
                this.request(nextRequest);
            }else{
                if(this.afterGameCallback){
                    this.afterGameCallback();
                }
            }
        });
    }
}