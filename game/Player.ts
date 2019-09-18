import {Card, OnEffectPlayed, CostReducing, OnTagPlayed, Tag} from "./Card";
import {Game, GameCycle} from "./Game";
import {remove} from "./Utils";
import {Messenger} from "../client/Messenger";
import {ResourceType, Resource} from "./Resource";
import {GlobalEffect} from "./GlobalEffect";
import {ActionRequest} from "./ActionRequest";

export class Player{
    cardBuyPrice: number = 3;
    playedCards: Card[] = [];
    hand: Card[] = [];
    cardsToBuy: Card[] = [];
    costReducingCards: CostReducing[] = [];
    onTagCards: OnTagPlayed[] = [];
    onEffectCards: OnEffectPlayed[] = [];

    terraformingRating: number = 20;
    resources: Map<ResourceType, number> = new Map<ResourceType, number>();
    production: Map<ResourceType, number> = new Map<ResourceType, number>();
    collectedTags: Map<Tag, number> = new Map<Tag, number>();
    steelWorth: number = 2;
    titaniumWorth: number = 3;

    constructor(private game: Game, private messenger: Messenger){
    }

    getResource = (type: ResourceType): number => this.resources.get(type) || 0;
    changeResource = (type: ResourceType, amount: number): void => {this.resources.set(type, this.getResource(type)+amount)};
    addResource = (resource: Resource): void => this.changeResource(resource.type, resource.amount);
    getProduction = (type: ResourceType): number => this.production.get(type) || 0;
    changeProduction = (type: ResourceType, amount: number): void => {this.production.set(type, this.getProduction(type)+amount)};
    payMoney = (amount: number): void => this.changeResource("megacredit", -amount);

    cardBuyAmount = (): number => Math.max(4, Math.floor(this.getResource("megacredit")/this.cardBuyPrice));

    addCostReducingCard = (card: CostReducing): void => {this.costReducingCards.push(card)};
    addOnTagCard = (card: OnTagPlayed): void => {this.onTagCards.push(card)};
    addOnEffectCard = (card: OnEffectPlayed): void => {this.onEffectCards.push(card)};

    getNumTags = (tag: Tag): number => this.collectedTags.get(tag) || 0;
    addTag = (tag: Tag): void => {this.collectedTags.set(tag, this.getNumTags(tag))};
    addTags = (tags: Tag[]): void => tags.forEach((tag: Tag) => this.addTag(tag));

    costReduction = (card: Card): number => this.costReducingCards.reduce((acc, crCard) => acc+crCard.reduceCost(card), 0);

    drawToBuy = (n: number): void => {this.cardsToBuy = this.game.draw(n)};
    draw = (n: number): void => {this.hand = this.hand.concat(this.game.draw(n))};
    buy(cards: Card[]): void{
        this.payMoney(this.cardBuyPrice*cards.length);
        cards.forEach((card: Card) => this.hand.push(remove(this.cardsToBuy, card)));
    }
    playFromHand = (card: Card): void => {this.playedCards.push(remove(this.hand, card))};
    onTagPlayed = (card: Card): void => this.onTagCards.forEach((tagCard) => tagCard.onTagPlayed(card));
    onEffectPlayed = (effect: GlobalEffect): void => this.onEffectCards.forEach((effectCard) => effectCard.onEffectPlayed(effect));
    request(request: ActionRequest, gameCycle: GameCycle): void {
        return this.messenger.request(request, gameCycle);
    }
    * play(card: Card): GameCycle{
        yield * card.play(this, this.game.board, this.game.cycle);
    }
}

export type Color ="blue"|"green"|"yellow"|"red"|"gray";
