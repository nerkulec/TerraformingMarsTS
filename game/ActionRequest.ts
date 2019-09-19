import {Player} from "./Player";
import {Tag} from "./Card";
import {Resource} from "./Resource";

type ActionType = 'ChooseName'|'ChooseAction'|'EnemySelection'|'SplitPayment'|'ChooseUpTo'|'PlaceHex';


export abstract class ActionRequest{
    constructor(public player: Player, public type: ActionType){
    }
    getInfo(): Object{
        return {type: this.type}
    }
}

export interface ActionResponse{
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

export class ChooseName extends ActionRequest{
    constructor(player: Player){
        super(player, 'ChooseName');
    }
}

export class SplitPayment extends ActionRequest{
    constructor(player: Player, private cost: number, private tags: Tag[]){
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