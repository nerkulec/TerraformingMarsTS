
export function remove<T>(arr: T[], elem: T): T {
    let index = arr.indexOf(elem);
    if(index > -1){
        return arr.splice(index, 1)[0];
    }
    throw Error("Element not in array");
}

export function shuffle(a: any[]): void {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}

export function * chain<T1, T2>(a: Generator<T1, void,  T2>, b: Generator<T1, void, T2>): Generator<T1, void, T2>{
    yield * a;
    yield * b;
}

