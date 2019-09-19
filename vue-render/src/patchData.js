const domPropsRE = /\W|^(?:value|checked|seleted|muted)$/;

export function patchData(el, key, prevValue, nextValue) {
    switch (key) {
        case 'style':
            for (const key in nextValue) {
                el['style'][key] = nextValue[key];
            }
            for (const key in prevValue) {
                if (!nextValue.hasOwnProperty(key)) {
                    el['style'][key] = '';
                }
            }
            break;
        case 'class':
            el.className = nextValue;
            break;
        default:
            if (key[0] === 'o' && key[1] === 'n') {
                if (prevValue) {
                    el.removeEventListener(key.slice(2), prevValue);
                }
                if (nextValue) {
                    el.addEventListener(key.slice(2), nextValue);
                }
            }
            else if (domPropsRE.test(key)) {
                el[key] = nextValue;
            } else {
                el.setAttribute(key, nextValue);
            }
    }
}
