enum CardType{
    Green,
    Blue,
    Red
}

enum Tag{
    building,
    space,
    plant,
    animal,
    microbe,
    science,
    energy,
    event,
    jupiter,
    earth
}

interface OnCardPlayed extends Card{
    onCardPlayed: (card: Card) => void;
}

interface OnEffect extends Card{
    onEffect: (effect: GlobalEffect) => void;
}

interface CostReducing extends Card{
    reduceCost: (card: Card) => number;
}

interface Active extends Card{
    used: boolean;
    active: (player: Player) => void;
}

abstract class Card{
    type: CardType = CardType.Green;
    cost: number = 0;
    requirement?: Requirement;
    flatVictoryPoints: number = 0;
    terraformingRating: number = 0;
    tags: Tag[] = [];
    flavorText: string = '';

    costReducing: boolean = false;
    effectCard: boolean = false;
    activeCard: boolean = false;

    effects: GlobalEffect[] = [];
    resources: Resource[] = [];
    production: Resource[] = [];
    enemyResources: Resource[] = [];
    enemyProduction: Resource[] = [];

    hasTag = (tag: Tag): boolean => this.tags.includes(tag);
    playable = (player: Player, board: Board): boolean => {
        if(!this.resources.every((res) => player.getResource(res.type)+res.amount >= 0)) {
            return false;
        }
        if(!this.production.every((res) => res.type == ResourceType.megacredit 
            ? player.getProduction(res.type)+res.amount >= -5 
            : player.getProduction(res.type)+res.amount >= 0)) {
            return false;
        }
        let tempCost: number = this.cost;
        tempCost -= player.costReduction(this);
        let maxCost: number = player.getResource(ResourceType.megacredit)
        maxCost += player.getResource(ResourceType.steel)*player.steelWorth;
        maxCost += player.getResource(ResourceType.titanium)*player.titaniumWorth;
        if(maxCost < tempCost){
            return false;
        }
        return this.requirement === undefined || this.requirement.satisfied(player, board); 
    }
}
