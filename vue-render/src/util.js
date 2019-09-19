function lis(arr) {
    const len = arr.length;
    const table = [];
    for (let i = 0; i < len; i ++) {
        table.push(1);
    }

    let index = len - 2;
    while (index >= 0) {
        const arrIndex = arr[index];
        for (let start = index + 1; start < len; start ++) {
            if (arrIndex < arr[start] && table[index] < table[start] + 1) {
                table[index] = table[start] + 1;
            }
        }
        index --;
    }

    // console.log(table);
    // 找最后一个
    const res = [];
    let count = 1;
    let dLen = len - 1;
    while (dLen >= 0) {
        if (count === table[dLen]) {
            count ++;
            res.unshift(dLen);
        }
        dLen --;
    }

    return res;
}

export { lis }
