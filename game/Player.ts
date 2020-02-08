import {Card, OnEffectPlayed, CostReducingCard, OnTagPlayed, Tag} from "./Card"
import {Game, } from "./Game"
import {remove} from "./Utils"
import {Messenger, MockMessenger} from "../app/Messenger"
import {ResourceType, Resource} from "./Resource"
import {GlobalEffect} from "./GlobalEffect"
import {InteractionRequest} from "./InteractionRequest"

export class Player{
    name: string

    cardBuyPrice: number = 3
    playedCards: Card[] = []
    hand: Card[] = []
    cardsToBuy: Card[] = []
    costReducingCards: CostReducingCard[] = []
    onTagCards: OnTagPlayed[] = []
    onEffectCards: OnEffectPlayed[] = []

    terraformingRating: number = 20
    resources: Map<ResourceType, number> = new Map<ResourceType, number>()
    production: Map<ResourceType, number> = new Map<ResourceType, number>()
    collectedTags: Map<Tag, number> = new Map<Tag, number>()
    steelWorth: number = 2
    titaniumWorth: number = 3

    constructor(public game: Game, public messenger: Messenger, player_info: any) {
        this.name = player_info.name
    }

    async request(request: InteractionRequest){
        return await this.messenger.request(request)
    }

    async execute(action: any){
        if(action.playCard){
            await this.play(action.playCard)
        }
    }

    getResource = (type: ResourceType): number => this.resources.get(type) || 0
    changeResource = (type: ResourceType, amount: number): void => {this.resources.set(type, this.getResource(type)+amount)}
    addResource = (resource: Resource): void => this.changeResource(resource.type, resource.amount)
    getProduction = (type: ResourceType): number => this.production.get(type) || 0
    changeProduction = (type: ResourceType, amount: number): void => {this.production.set(type, this.getProduction(type)+amount)}
    payMoney = (amount: number): void => this.changeResource("megacredit", -amount)

    cardBuyAmount = (): number => Math.max(4, Math.floor(this.getResource("megacredit")/this.cardBuyPrice))

    addCostReducingCard = (card: CostReducingCard): void => {this.costReducingCards.push(card)}
    addOnTagCard = (card: OnTagPlayed): void => {this.onTagCards.push(card)}
    addOnEffectCard = (card: OnEffectPlayed): void => {this.onEffectCards.push(card)}

    getNumTags = (tag: Tag): number => this.collectedTags.get(tag) || 0
    addTag = (tag: Tag): void => {this.collectedTags.set(tag, this.getNumTags(tag))}
    addTags = (tags: Tag[]): void => tags.forEach((tag: Tag) => this.addTag(tag))

    costReduction = (card: Card): number => this.costReducingCards.reduce((acc, crCard) => acc+crCard.reduceCost(card), 0)

    drawToBuy = (n: number): void => {this.cardsToBuy = this.game.draw(n)}
    draw = (n: number): void => {this.hand = this.hand.concat(this.game.draw(n))}
    buy(cards: Card[]): void{
        this.payMoney(this.cardBuyPrice*cards.length)
        cards.forEach((card: Card) => this.hand.push(remove(this.cardsToBuy, card)))
    }
    playFromHand = (card: Card): void => {this.playedCards.push(remove(this.hand, card))}
    onTagPlayed = (card: Card): void => this.onTagCards.forEach((tagCard) => tagCard.onTagPlayed(card))
    onEffectPlayed = (effect: GlobalEffect): void => this.onEffectCards.forEach((effectCard) => effectCard.onEffectPlayed(effect))
    canPlay = (card: Card): boolean => card.playable(this, this.game.board)
    async play(card: Card){
        await card.play(this, this.game.board)
    }
    globalEffect = (effect: GlobalEffect): void => effect.effect(this, this.game.board)
}

export type Color ="blue"|"green"|"yellow"|"red"|"gray"

export class MockPlayer extends Player {
    constructor(public game: Game, public messenger: MockMessenger, playerInfo: any) {
        super(game, messenger, playerInfo)
    }
}