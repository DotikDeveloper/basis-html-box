function date(selector) {
    const date = new Date().getFullYear();
    document.querySelector(selector).innerHTML = date;
}

export default date;