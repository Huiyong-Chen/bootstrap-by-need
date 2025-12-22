export function domClassToggle(dom, className, remove = false) {
    if (remove) {
        dom.classList.remove(className);
    }
    else {
        dom.classList.add(className);
    }
}
