import {Player} from "./Player";
import {Tag} from "./Card";
import {Resource, ResourceType} from "./Resource";
import {HexType, Place} from "./Hex";
import { ensure } from "./Utils";

type ActionType = 'ChooseName'|'ChooseAction'|'EnemySelection'|'SplitPayment'|'ChooseUpTo'|'PlaceHex'|'NumberSelection'|'ResourcesRequest';


export abstract class ActionRequest{
    constructor(public player: Player, public type: ActionType){
    }
    getInfo(): Object{
        return {type: this.type}
    }
}

export interface ActionResponse{
}

export function parseResponse(response: Object): ActionResponse{
    return response; // Do some deserialization/unpacking/decompressing
}

export class StringResponse implements ActionResponse{
    constructor(public str: string){
    }
}
export class NumberResponse implements ActionResponse{
    constructor(public num: number){
    }
}
export class ResourcesResponse implements ActionResponse{
    constructor(public resources: Resource[]){
    }
}

export class PlaceResponse implements ActionResponse{
    constructor(public places: Place[]){
    }
}

export class PlayerResponse implements ActionResponse{
    constructor(public player: Player){
    }
}

export class ChooseName extends ActionRequest{
    constructor(player: Player){
        super(player, 'ChooseName');
    }
}

export class SplitPayment extends ActionRequest{
    constructor(player: Player, public cost: number, public tags: Tag[]){
        super(player, 'SplitPayment');
    }
    getInfo(): Object{
        return {
            ...super.getInfo(),
            cost: this.cost,
            tags: this.tags
        }
    }
}

export class PlaceHex extends ActionRequest{
    constructor(player: Player, public hexType: HexType, public num: number){
        super(player, 'PlaceHex');
    }
    getInfo(): Object{
        return {
            ...super.getInfo(),
            hexType: this.hexType,
            num: this.num
        }
    }
}

export class EnemySelection extends ActionRequest{
    constructor(player: Player){
        super(player, 'EnemySelection');
    }
}

export class NumberSelection extends ActionRequest{
    constructor(player: Player){
        super(player, 'NumberSelection');
    }
}

export class ChooseUpTo extends ActionRequest{
    constructor(player: Player, public resourceType: ResourceType, public upTo: number, public production=false){
        super(player, 'ChooseUpTo');
    }
    getInfo(): Object{
        return {
            ...super.getInfo(),
            resourceType: this.resourceType,
            upTo: this.upTo,
            production: this.production
        }
    }
}