enum ActionType{
    ChooseName,
    ChooseAction,
    EnemySelection,
    SplitPayment,
    ChooseUpTo,
    PlaceHex
}

abstract class ActionRequest{
    constructor(public player: Player, private type: ActionType){
    }
    getInfo(): Object{
        return {type: this.type}
    }
}

interface ActionResponse{
    string: string;
    resources: Resource[];
}

class ChooseName extends ActionRequest{
    constructor(player: Player){
        super(player, ActionType.ChooseName);
    }
}

class SplitPayment extends ActionRequest{
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