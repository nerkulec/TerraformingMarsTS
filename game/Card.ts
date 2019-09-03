enum CardType{
    Green,
    Blue,
    Red
}

enum Tag{
    
}

class Card{
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

    effects: MarkerEffect[] = [];
    resources: Resource[] = [];
    production: Resource[] = [];
    enemyResources: Resource[] = [];
    enemyProduction: Resource[] = [];

    used: boolean = false;

    hasTag = (tag: Tag): boolean => this.tags.includes(tag);


}
