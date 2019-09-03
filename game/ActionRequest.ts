enum ActionType{
    ChooseAction,
    EnemySelection,
    SplitPayment,
    ChooseUpTo,
    PlaceHex
}

interface ActionRequest{
    type: ActionType;
}