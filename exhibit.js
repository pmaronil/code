function switchImage(painting) {
    // paintingElem is the painting that was clicked on */
    var paintingElem = document.getElementById(painting);
    // activePainting is the large picture being displayed
    var activePainting = document.getElementById("active");

    activePainting.innerHTML = paintingElem.innerHTML;
}
