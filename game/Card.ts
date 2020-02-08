import {Player} from "./Player"
import {Board} from "./Board"
import {Game} from "./Game"
import {Resource} from "./Resource"
import {Requirement} from "./Requirement"
import {GlobalEffect, OceansEffect} from "./GlobalEffect"
import {Hex, Place} from "./Hex"
import {SplitPayment, PlaceHex, EnemySelection, ChooseUpTo} from "./InteractionRequest"

type CardType = 'green'|'blue'|'red'
export type Tag = "building"|"space"|"plant"|"animal"|"microbe"|"science"|"energy"|"event"|"jupiter"|"earth"

export abstract class Card{
    type: CardType = 'green'
    cost: number = 0
    requirement?: Requirement
    flatVictoryPoints: number = 0
    terraformingRating: number = 0
    tags: Tag[] = []
    flavorText: string = ''

    effects: GlobalEffect[] = []
    resources: Resource[] = []
    production: Resource[] = []
    enemyResources: Resource[] = []
    enemyProduction: Resource[] = []

    collectedAmount: number = 0
    collects?: string

    upTo: boolean = false

    hasTag = (tag: Tag): boolean => this.tags.includes(tag)
    playable(player: Player, board: Board): boolean{
        if(!this.resources.every((res) => player.getResource(res.type)+res.amount >= 0)) {
            return false
        }
        if(!this.production.every((res) => res.type == "megacredit"
            ? player.getProduction(res.type)+res.amount >= -5 
            : player.getProduction(res.type)+res.amount >= 0)) {
            return false
        }
        let tempCost: number = this.cost
        tempCost -= player.costReduction(this)
        let maxCost: number = player.getResource("megacredit")
        if(this.hasTag("building")){
            maxCost += player.getResource("steel") * player.steelWorth
        }
        if(this.hasTag("space")){
            maxCost += player.getResource("titanium") * player.titaniumWorth
        }
        if(maxCost < tempCost){
            return false
        }
        return this.requirement === undefined || this.requirement.satisfied(player, board) 
    }

    async pay(player: Player){
        let tempCost: number = this.cost
        tempCost -= player.costReduction(this)
        if(this.tags.includes('building') || this.tags.includes('space')){
            let resources = await player.request(new SplitPayment(player, tempCost, this.tags))
            for(const res of resources){
                if(res.type == "steel"){
                    player.changeResource("steel", -res.amount)
                    tempCost -= res.amount * player.steelWorth
                }else if(res.type == "titanium"){
                    player.changeResource("titanium", -res.amount)
                    tempCost -= res.amount * player.titaniumWorth
                }
            }
        }
        player.changeResource("megacredit", -tempCost)
    }

    async play(player: Player, board: Board){
        await this.pay(player)
        player.playFromHand(this)
        player.onTagPlayed(this)
        if(this.type != 'red'){
            player.addTags(this.tags)
        }
        for(const effect of this.effects){
            if(effect instanceof OceansEffect){
                let places = await player.request(new PlaceHex(player, 'ocean', effect.times))
                places.forEach((place: Place)=>board.placeHex(place, new Hex('ocean')))
            }
            player.globalEffect(effect)
        }
        for(const res of this.resources){
            player.changeResource(res.type, res.amount)
        }
        for(const res of this.production){
            player.changeProduction(res.type, res.amount)
        }
        if(this.enemyResources.length > 0 || this.enemyProduction.length > 0){
            let enemy = await player.request(new EnemySelection(player))
            for(const res of this.enemyResources){
                let amount = res.amount
                if(res.upTo){
                    amount = await player.request(new ChooseUpTo(player, res.type, res.amount))
                }
                enemy.changeResource(res.type, amount)
            }
            for(const res of this.enemyProduction){
                let amount = res.amount
                if(res.upTo){
                    amount = await player.request(new ChooseUpTo(player, res.type, res.amount, true))
                }
                enemy.changeProduction(res.type, amount)
            }
        }
    }

    victoryPoints(player: Player, game: Game): number{
        return this.flatVictoryPoints
    }
}



export abstract class OnTagPlayed extends Card{
    abstract onTagPlayed(card: Card): void
    async play(player: Player, board: Board){
        player.addOnTagCard(this)
        await super.play(player, board)
    }
}

export abstract class OnEffectPlayed extends Card{
    abstract onEffectPlayed(effect: GlobalEffect): void
    async play(player: Player, board: Board){
        player.addOnEffectCard(this)
        await super.play(player, board)
    }
}

export abstract class CostReducingCard extends Card{
    abstract reduceCost(card: Card): number
    async play(player: Player, board: Board){
        player.addCostReducingCard(this)
        await super.play(player, board)
    }
}

export abstract class ActiveCard extends Card{
    type: CardType = "blue"
    used: boolean = false
    abstract actionAvailible(player: Player): boolean
    async action(player: Player) {
        this.used = true
    }
    reset(): void {
        this.used = false
    }
}