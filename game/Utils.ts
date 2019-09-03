
let remove = (arr: any[], elem: any): void => {
    let index = arr.indexOf(elem);
    if(index > -1){
        arr.splice(index, 1)
    }
}

let shuffle = (a: any[]): void => {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}

