import {Player} from "./Player";
import {Tag} from "./Card";
import {Resource} from "./Resource";

enum ActionType{
    ChooseName,
    ChooseAction,
    EnemySelection,
    SplitPayment,
    ChooseUpTo,
    PlaceHex
}

export abstract class ActionRequest{
    constructor(public player: Player, private type: ActionType){
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

export class ChooseName extends ActionRequest{
    constructor(player: Player){
        super(player, ActionType.ChooseName);
    }
}

export class SplitPayment extends ActionRequest{
    constructor(player: Player, private cost: number, private tags: Tag[]){
        super(player, ActionType.SplitPayment);
    }
    getInfo(): Object{
        return {
            ...super.getInfo(),
            cost: this.cost,
            tags: this.tags
        }
    }
}