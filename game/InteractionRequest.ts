import {Player} from "./Player";
import {Tag} from "./Card";
import {Resource, ResourceType} from "./Resource";
import {HexType, Place} from "./Hex";
import {ensure} from "./Utils";

export abstract class InteractionRequest{
    constructor(public player: Player){
    }
    abstract getInfo(): Object;
}

export function parseResponse(response: Object): any{
    return response; // Do some deserialization/unpacking/decompressing
}

export class ChooseColor extends InteractionRequest{
    constructor(player: Player){
        super(player);
    }
    getInfo(): Object{
        return {}
    }
}

export class ChooseName extends InteractionRequest{
    constructor(player: Player){
        super(player);
    }
    getInfo(): Object{
        return {}
    }
}

export class SplitPayment extends InteractionRequest{
    constructor(player: Player, public cost: number, public tags: Tag[]){
        super(player);
    }
    getInfo(): Object{
        return {
            cost: this.cost,
            tags: this.tags
        }
    }
}

export class PlaceHex extends InteractionRequest{
    constructor(player: Player, public hexType: HexType, public num: number){
        super(player);
    }
    getInfo(): Object{
        return {
            hexType: this.hexType,
            num: this.num
        }
    }
}

export class EnemySelection extends InteractionRequest{
    constructor(player: Player){
        super(player);
    }
    getInfo(): Object{
        return {}
    }
}

export class CardSelection extends InteractionRequest{
    constructor(player: Player){
        super(player);
    }
    getInfo(): Object{
        return {}
    }
}
export class NumberSelection extends InteractionRequest{
    constructor(player: Player){
        super(player);
    }
    getInfo(): Object{
        return {}
    }
}

export class ChooseUpTo extends InteractionRequest{
    constructor(player: Player, public resourceType: ResourceType, public upTo: number, public production=false){
        super(player);
    }
    getInfo(): Object{
        return {
            resourceType: this.resourceType,
            upTo: this.upTo,
            production: this.production
        }
    }
}