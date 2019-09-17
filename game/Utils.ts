
function remove<T>(arr: T[], elem: T): T {
    let index = arr.indexOf(elem);
    if(index > -1){
        return arr.splice(index, 1)[0];
    }
    throw Error("Element not in array");
}

function shuffle(a: any[]): void {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}

