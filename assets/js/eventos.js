var { changeEvent, openEvent } = (() => {
    let eventos = [
        {
            // Info
            img: "/img/evento1.png"
        },
        {
            img: "/img/evento2.jpg"
        },
        {
            img: "/img/evento3.jpg"
        },
        {
            img: "/img/evento4.jpg"
        }
    ];

    const imgEvento = document.getElementById("imgEvento");

    let currentIndex = 0;

    function changeEvent(index) {
        if (eventos[index]) {
            imgEvento.src = eventos[index].img
            currentIndex = index;
        } else if (eventos.length !== 0) {
            changeEvent(index - eventos.length);
        }
    }

    Object.defineProperty(changeEvent, "currentIndex", {
        get() { return currentIndex }
    })

    const listaEventosDOM = document.getElementById("listaEventos");
    for (let i = 0; i < listaEventosDOM.children.length; i++) {
        let childIndex = i;
        listaEventosDOM.children[i].addEventListener("click", () => changeEvent(childIndex));
    }

    setInterval(() => {
        changeEvent(changeEvent.currentIndex + 1);
    }, 7000);
    
    function openEvent() {
        Swal.fire({})
    }

    return { changeEvent, openEvent }
})();