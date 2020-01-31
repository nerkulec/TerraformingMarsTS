import {ActiveCard} from "../Card";
import {OxygenRequirement} from "../Requirement";
import {Player} from "../Player";
import {CardSelection} from "../InteractionRequest";

export class Ants extends ActiveCard{
    constructor(){
        super();
        this.cost = 9;
        this.tags = ['microbe'];
        this.collects = 'microbe';
        this.requirement = new OxygenRequirement(4);
    }
    actionAvailible(player: Player){
        return !this.used && player.game.players.some(p => p.playedCards.some(c => c.collects == 'microbe'))
    }
    victoryPoints(player: Player){
        return Math.floor(this.collectedAmount/2);
    }

    * action(player: Player){
        const card = yield new CardSelection(player);
        card.collectedAmount -= 1;
        this.collectedAmount += 1;
        yield* super.action(player);
    }
}