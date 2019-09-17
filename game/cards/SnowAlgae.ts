class SnowAlgae extends Card{
    constructor(){
        super();
        this.cost = 12;
        this.tags = [Tag.plant];
        this.production = [new Resource('heat'), new Resource('plant')];
    }
}