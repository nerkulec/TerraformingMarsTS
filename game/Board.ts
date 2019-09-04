abstract class Board{
    abstract hexes: Hex[][];
    abstract spaceHexes: Hex[];
    abstract milestones: Milestone[];
    abstract awards: Award[];

    temperature: TerraformingMarker = new Temperature();
    oxygen: TerraformingMarker = new Oxygen();
    oceans: TerraformingMarker = new Oceans();

    numCities: number = 0;

    constructor(public game: Game){
    }

    getHex = (x: number, y: number): Hex => this.hexes[x][y];
}