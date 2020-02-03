import {Player, Color} from "./Player"
import {Tag} from "./Card"
import {ResourceType} from "./Resource"
import {HexType} from "./Hex"

type Info = {
    type: string,
    cost?: number,
    hexType?: HexType,
    num?: number,
    resourceType?: ResourceType,
    upTo?: number,
    production?: boolean,
    tags?: Tag[],
    second?: boolean,
    colors?: Color[]
}

export abstract class InteractionRequest{
    abstract type: string
    message?: string
    constructor(public player: Player){
    }
    getInfo(): Info{
        return {type: this.type+'|'+this.player.name}
    }
    valid(response: any): boolean{
        console.log('WARNING: no validation of response')
        return true
    }
    parse(response: any): any{
        return response
    }
}

export class ChooseAction extends InteractionRequest{
    type = 'chooseAction'
    constructor(player: Player, public second: boolean = false){
        super(player)
    }
    getInfo(): Info{
        let info = super.getInfo()
        info.second = this.second
        return info
    }
}

export class ChooseColor extends InteractionRequest{
    type = 'ChooseColor'
    constructor(player: Player, public colors: Color[]){
        super(player)
    }
    getInfo(): Info{
        let info = super.getInfo()
        info.colors = this.colors
        return info
    }
    parse(response: any): any{
        response.player = this.player
        return response
    }
}

export class SplitPayment extends InteractionRequest{
    type = 'SplitPayment'
    constructor(player: Player, public cost: number, public tags: Tag[]){
        super(player)
    }
    getInfo(): Info{
        let info = super.getInfo()
        info.cost = this.cost
        info.tags = this.tags
        return info
    }
}

export class PlaceHex extends InteractionRequest{
    type = 'PlaceHex'
    constructor(player: Player, public hexType: HexType, public num: number){
        super(player)
    }
    getInfo(): Info{
        let info = super.getInfo()
        info.hexType = this.hexType,
        info.num = this.num
        return info
    }
}

export class EnemySelection extends InteractionRequest{
    type = 'EnemySelection'
    constructor(player: Player){
        super(player)
    }
}

export class CardSelection extends InteractionRequest{
    type = 'CardSelection'
    constructor(player: Player){
        super(player)
    }
}
export class NumberSelection extends InteractionRequest{
    type = 'NumberSelection'
    constructor(player: Player){
        super(player)
    }
}

export class ChooseUpTo extends InteractionRequest{
    type = 'ChooseUpTo'
    constructor(player: Player, public resourceType: ResourceType, public upTo: number, public production=false){
        super(player)
    }
    getInfo(): Info{
        let info = super.getInfo()
        this.resourceType = this.resourceType
        this.upTo = this.upTo
        this.production = this.production
        return info
    }
}