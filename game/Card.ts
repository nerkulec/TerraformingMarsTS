enum CardType{
    green,
    blue,
    red
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

abstract class Card{
    type: CardType = CardType.green;
    cost: number = 0;
    requirement?: Requirement;
    flatVictoryPoints: number = 0;
    terraformingRating: number = 0;
    tags: Tag[] = [];
    flavorText: string = '';

    effects: GlobalEffect[] = [];
    resources: Resource[] = [];
    production: Resource[] = [];
    enemyResources: Resource[] = [];
    enemyProduction: Resource[] = [];

    hasTag = (tag: Tag): boolean => this.tags.includes(tag);
    playable(player: Player, board: Board): boolean{
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

    pay(player: Player): void{
        let tempCost: number = this.cost;
        tempCost -= player.costReduction(this);
        if(this.tags.includes(Tag.building) || this.tags.includes(Tag.space)){
            let request = new SplitPayment(tempCost, this.tags);
            player.request(request);
            let resources: Resource[] = [];
            for(const res of resources){
                if(res.type == ResourceType.steel){
                    player.changeResource(ResourceType.steel, -res.amount);
                    tempCost -= res.amount*player.steelWorth;
                }else if(res.type == ResourceType.titanium){
                    player.changeResource(ResourceType.titanium, -res.amount);
                    tempCost -= res.amount*player.titaniumWorth;
                }
            }
        }
        player.changeResource(ResourceType.megacredit, -tempCost)
    }

    play(player: Player, board: Board): void{
        this.pay(player);
        player.playFromHand(this);
        player.onTagPlayed(this);
        if(this.type != CardType.red){
            player.addTags(this.tags);
        }
        for(const effect of this.effects){
            effect.effect(player, board);
        }
        for(const res of this.resources){
            player.changeResource(res.type, res.amount);
        }
        for(const res of this.production){
            player.changeProduction(res.type, res.amount);
        }
        if(this.enemyResources.length > 0 || this.enemyProduction.length > 0){
            let enemy: Player = player; // TODO: Choose enemy
            for(const res of this.resources){
                enemy.changeResource(res.type, res.amount);
            }
            for(const res of this.production){
                enemy.changeProduction(res.type, res.amount);
            }
        }
    }

    victoryPoints(player: Player, game: Game): number{
        return this.flatVictoryPoints;
    }
}



abstract class OnTagPlayed extends Card{
    abstract onTagPlayed(card: Card): void;
    play(player: Player, board: Board): void{
        player.addOnTagCard(this);
        super.play(player, board);
    }
}

abstract class OnEffectPlayed extends Card{
    abstract onEffectPlayed(effect: GlobalEffect): void;
    play(player: Player, board: Board): void{
        player.addOnEffectCard(this);
        super.play(player, board);
    }
}

abstract class CostReducing extends Card{
    abstract reduceCost(card: Card): number;
    play(player: Player, board: Board): void{
        player.addCostReducingCard(this);
        super.play(player, board);
    }
}

abstract class Active extends Card{
    used: boolean = false;
    abstract actionAvailible(player: Player): void;
    action(player: Player): void {
        this.used = true;
    }
    reset(): void {
        this.used = false;
    }
}