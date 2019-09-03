class Player{
    cardBuyPrice: number = 3;

    playedCards: Card[] = [];
    hand: Card[] = [];
    cardsToBuy: Card[] = [];

    resources: Map<ResourceType, number> = new Map<ResourceType, number>();
    production: Map<ResourceType, number> = new Map<ResourceType, number>();

    constructor(private game: Game){
    }

    getResource = (type: ResourceType): number => this.resources.get(type) || 0;
    changeResource = (type: ResourceType, amount: number): void => {this.resources.set(type, this.getResource(type)+amount)};
    addResource = (resource: Resource): void => this.changeResource(resource.type, resource.amount);
    getProduction = (type: ResourceType): number => this.production.get(type) || 0;
    changeProduction = (type: ResourceType, amount: number): void => {this.production.set(type, this.getProduction(type)+amount)};
    payMoney = (amount: number): void => this.changeResource(ResourceType.Megacredit, -amount);

    cardBuyAmount = (): number => Math.max(4, Math.floor(this.getResource(ResourceType.Megacredit)/this.cardBuyPrice));

    drawToBuy = (n: number): void => {this.cardsToBuy = this.game.draw(n)};
    draw = (n: number): void => {this.hand = this.hand.concat(this.game.draw(n))};


    buy = (cards: Card[]): void => {
        this.payMoney(this.cardBuyPrice*cards.length);
        for(const card of cards){
            remove(this.cardsToBuy, card);
            this.hand.push(card);
        }
    }
}