import {Player} from "./Player";
import {Board} from "./Board";
import {GameCycle, Game} from "./Game";
import {ActionResponse, SplitPayment, ResourcesResponse, PlaceHex, EnemySelection, PlayerResponse, PlaceResponse, NumberSelection, ChooseUpTo, NumberResponse} from "./ActionRequest";
import {Resource} from "./Resource";
import {Requirement} from "./Requirement";
import {GlobalEffect, OceansEffect} from "./GlobalEffect";
import {ensure} from "./Utils";
import { Hex } from "./Hex";

type CardType = 'green'|'blue'|'red';
export type Tag = "building"|"space"|"plant"|"animal"|"microbe"|"science"|"energy"|"event"|"jupiter"|"earth";

export abstract class Card{
    type: CardType = 'green';
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

    upTo: boolean = false;

    hasTag = (tag: Tag): boolean => this.tags.includes(tag);
    playable(player: Player, board: Board): boolean{
        if(!this.resources.every((res) => player.getResource(res.type)+res.amount >= 0)) {
            return false;
        }
        if(!this.production.every((res) => res.type == "megacredit"
            ? player.getProduction(res.type)+res.amount >= -5 
            : player.getProduction(res.type)+res.amount >= 0)) {
            return false;
        }
        let tempCost: number = this.cost;
        tempCost -= player.costReduction(this);
        let maxCost: number = player.getResource("megacredit")
        maxCost += player.getResource("steel")*player.steelWorth;
        maxCost += player.getResource("titanium")*player.titaniumWorth;
        if(maxCost < tempCost){
            return false;
        }
        return this.requirement === undefined || this.requirement.satisfied(player, board); 
    }

    * pay(player: Player, gameCycle: GameCycle): GameCycle{
        let tempCost: number = this.cost;
        tempCost -= player.costReduction(this);
        if(this.tags.includes('building') || this.tags.includes('space')){
            let response: ActionResponse = yield new SplitPayment(player, tempCost, this.tags);
            let resources: Resource[] = ensure(response, ResourcesResponse).resources;
            for(const res of resources){
                if(res.type == "steel"){
                    player.changeResource("steel", -res.amount);
                    tempCost -= res.amount*player.steelWorth;
                }else if(res.type == "titanium"){
                    player.changeResource("titanium", -res.amount);
                    tempCost -= res.amount*player.titaniumWorth;
                }
            }
        }
        player.changeResource("megacredit", -tempCost)
    }

    * play(player: Player, board: Board, gameCycle: GameCycle): GameCycle{
        yield* this.pay(player, gameCycle);
        player.playFromHand(this);
        player.onTagPlayed(this);
        if(this.type != 'red'){
            player.addTags(this.tags);
        }
        for(const effect of this.effects){
            if(effect instanceof OceansEffect){
                let oceansPlacement = yield new PlaceHex(player, 'ocean', effect.times);
                let places = ensure(oceansPlacement, PlaceResponse).places;
                places.forEach((place)=>board.placeHex(place, new Hex('ocean')));
            }
            player.globalEffect(effect);
        }
        for(const res of this.resources){
            player.changeResource(res.type, res.amount);
        }
        for(const res of this.production){
            player.changeProduction(res.type, res.amount);
        }
        if(this.enemyResources.length > 0 || this.enemyProduction.length > 0){
            let enemyChoice = yield new EnemySelection(player);
            let enemy = ensure(enemyChoice, PlayerResponse).player;
            for(const res of this.enemyResources){
                let amount = res.amount;
                if(this.upTo){
                    let upToChoice = yield new ChooseUpTo(player, res.type, res.amount);
                    amount = ensure(upToChoice, NumberResponse).num;
                }
                enemy.changeResource(res.type, amount);
            }
            for(const res of this.enemyProduction){
                let amount = res.amount;
                if(this.upTo){
                    let upToChoice = yield new ChooseUpTo(player, res.type, res.amount, true);
                    amount = ensure(upToChoice, NumberResponse).num;
                }
                enemy.changeProduction(res.type, amount);
            }
        }
    }

    victoryPoints(player: Player, game: Game): number{
        return this.flatVictoryPoints;
    }
}



export abstract class OnTagPlayed extends Card{
    abstract onTagPlayed(card: Card): GameCycle;
    * play(player: Player, board: Board, gameCycle: GameCycle): GameCycle{
        player.addOnTagCard(this);
        yield* super.play(player, board, gameCycle);
    }
}

export abstract class OnEffectPlayed extends Card{
    abstract onEffectPlayed(effect: GlobalEffect): void;
    * play(player: Player, board: Board, gameCycle: GameCycle): GameCycle{
        player.addOnEffectCard(this);
        yield* super.play(player, board, gameCycle);
    }
}

export abstract class CostReducing extends Card{
    abstract reduceCost(card: Card): number;
    * play(player: Player, board: Board, gameCycle: GameCycle): GameCycle{
        player.addCostReducingCard(this);
        yield* super.play(player, board, gameCycle);
    }
}

export abstract class Active extends Card{
    used: boolean = false;
    abstract actionAvailible(player: Player): void;
    * action(player: Player): GameCycle {
        this.used = true;
    }
    reset(): void {
        this.used = false;
    }
}