enum ActionType{
    ChooseAction,
    EnemySelection,
    SplitPayment,
    ChooseUpTo,
    PlaceHex
}

abstract class ActionRequest{
    constructor(private type: ActionType){
    }
}

class SplitPayment extends ActionRequest{
    constructor(private cost: number, private tags: Tag[]){
        super(ActionType.SplitPayment);
    }
}